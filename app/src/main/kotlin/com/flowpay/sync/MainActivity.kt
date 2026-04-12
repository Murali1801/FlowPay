package com.flowpay.sync

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.navigation.compose.*
import kotlinx.coroutines.launch
import com.flowpay.sync.data.ConfigManager
import com.flowpay.sync.network.*
import com.flowpay.sync.ui.screens.*
import com.flowpay.sync.ui.theme.*
import kotlinx.coroutines.delay
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

sealed class Screen(val route: String, val title: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    object Dashboard : Screen("dashboard", "Home", Icons.Default.Dashboard)
    object Sync : Screen("sync", "Sync", Icons.Default.Sync)
    object Transactions : Screen("transactions", "Orders", Icons.Default.ReceiptLong)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

class MainActivity : ComponentActivity() {
    private lateinit var config: ConfigManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        config = ConfigManager(this)

        checkPermissions()
        SyncService.start(this)

        setContent {
            FlowPayTheme {
                MainApp(config)
            }
        }
    }

    private fun checkPermissions() {
        val perms = mutableListOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
            perms.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        val missing = perms.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missing.toTypedArray(), 101)
        }
    }
}

@Composable
fun FlowPayTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Teal,
            secondary = Indigo,
            surface = Surface,
            background = Background
        ),
        content = content
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainApp(config: ConfigManager) {
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()
    var stats by remember { mutableStateOf<StatsResponse?>(null) }
    var orders by remember { mutableStateOf<List<OrderRow>>(emptyList()) }
    var showOnboarding by remember { mutableStateOf(config.isFirstRun) }

    val retrofit = remember {
        Retrofit.Builder()
            .baseUrl("https://flowpay-api.onrender.com") // Fallback, usually dynamic
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    val api = remember { retrofit.create(FlowPayApi::class.java) }

    val loadData = {
        scope.launch {
            try {
                val token = "Bearer ${config.bearerToken}"
                val statsRes = api.getStats(token)
                if (statsRes.isSuccessful) stats = statsRes.body()
                
                val ordersRes = api.getOrders(token)
                if (ordersRes.isSuccessful) orders = ordersRes.body() ?: emptyList()
            } catch (e: Exception) { /* ignored */ }
        }
    }

    LaunchedEffect(Unit) {
        while (true) {
            loadData()
            delay(30000) // Poll every 30s
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { 
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Brush.linearGradient(listOf(Teal, Indigo))),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("FP", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.width(8.dp))
                        Text("FlowPay Hub", fontWeight = FontWeight.ExtraBold, fontSize = 18.sp)
                    }
                },
                actions = {
                    IconButton(onClick = { loadData() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(containerColor = Surface)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Surface, tonalElevation = 8.dp) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                val items = listOf(Screen.Dashboard, Screen.Transactions, Screen.Sync, Screen.Settings)
                
                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = screen.title) },
                        label = { Text(screen.title, fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                        selected = currentRoute == screen.route,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.startDestinationId)
                                launchSingleTop = true
                            }
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Teal,
                            selectedTextColor = Teal,
                            unselectedIconColor = TextSecondary,
                            unselectedTextColor = TextSecondary,
                            indicatorColor = Teal.copy(alpha = 0.1f)
                        )
                    )
                }
            }
        }
    ) { padding ->
        NavHost(navController, startDestination = Screen.Dashboard.route, modifier = Modifier.padding(padding)) {
            composable(Screen.Dashboard.route) { DashboardScreen(stats, orders) }
            composable(Screen.Transactions.route) { TransactionsScreen(orders) }
            composable(Screen.Sync.route) { SyncScreen(config, onNavigateToRegex = { navController.navigate("regex_editor") }) }
            composable(Screen.Settings.route) { SettingsScreen() }
            composable("regex_editor") { RegexEditorScreen(config, onBack = { navController.popBackStack() }) }
        }
    }

    if (showOnboarding) {
        OnboardingScreen(onDismiss = {
            config.isFirstRun = false
            showOnboarding = false
        })
    }
}

@Composable
fun TransactionsScreen(orders: List<OrderRow>) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().background(Background).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text("Order History", fontSize = 18.sp, fontWeight = FontWeight.ExtraBold)
        }
        if (orders.isEmpty()) {
            item { Text("No transactions found.", modifier = Modifier.padding(top = 20.dp), color = TextSecondary) }
        } else {
            items(orders) { OrderListItem(it) }
        }
    }
}

@Composable
fun SettingsScreen() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("Account Settings & API Keys coming soon.")
    }
}
