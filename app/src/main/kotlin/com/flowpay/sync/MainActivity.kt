package com.flowpay.sync

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.flowpay.sync.data.ConfigManager
import com.flowpay.sync.ui.theme.*

class MainActivity : ComponentActivity() {
    private lateinit var config: ConfigManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        config = ConfigManager(this)

        checkPermissions()
        SyncService.start(this)

        setContent {
            FlowPayTheme {
                MainScreen(config)
            }
        }
    }

    private fun checkPermissions() {
        val perms = arrayOf(Manifest.permission.RECEIVE_SMS, Manifest.permission.READ_SMS)
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
fun MainScreen(config: ConfigManager) {
    var url by remember { mutableStateOf(config.webhookUrl) }
    var token by remember { mutableStateOf(config.bearerToken) }
    var filters by remember { mutableStateOf(config.senderFilter) }
    var logs by remember { mutableStateOf(config.lastSyncLog) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Brush.linearGradient(listOf(Teal, Indigo))),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("FP", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.width(10.dp))
                        Text("FlowPay Sync", fontWeight = FontWeight.ExtraBold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Surface)
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .background(Background)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                StatusCard()
            }

            item {
                ConfigSection(
                    url = url, onUrlChange = { url = it },
                    token = token, onTokenChange = { token = it },
                    filters = filters, onFiltersChange = { filters = it },
                    onSave = {
                        config.webhookUrl = url
                        config.bearerToken = token
                        config.senderFilter = filters
                        logs = config.lastSyncLog // Refresh logs
                    }
                )
            }

            item {
                Text(
                    "Recent Activity",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            item {
                LogCard(logs)
            }
        }
    }
}

@Composable
fun StatusCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .clip(CircleShape)
                    .background(Green)
            )
            Spacer(Modifier.width(12.dp))
            Column {
                Text("Sync Engine Active", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                Text("Listening for bank SMS messages...", color = TextSecondary, fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun ConfigSection(
    url: String, onUrlChange: (String) -> Unit,
    token: String, onTokenChange: (String) -> Unit,
    filters: String, onFiltersChange: (String) -> Unit,
    onSave: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            ConfigField("Webhook URL", url, onUrlChange, Icons.Default.Link, "https://...")
            ConfigField("Bearer Token", token, onTokenChange, Icons.Default.Lock, "Paste token here")
            ConfigField("Sender Filters", filters, onFiltersChange, Icons.Default.FilterList, "HDFCBK, SBIPAY...")
            
            Button(
                onClick = onSave,
                modifier = Modifier.fillMaxWidth().height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Teal)
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Save Configuration", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ConfigField(label: String, value: String, onValueChange: (String) -> Unit, icon: ImageVector, placeholder: String) {
    Column {
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = TextSecondary, modifier = Modifier.padding(bottom = 6.dp))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            placeholder = { Text(placeholder, fontSize = 14.sp) },
            leadingIcon = { Icon(icon, contentDescription = null, size(20.dp), tint = TextSecondary) },
            colors = OutlinedTextFieldDefaults.colors(
                unfocusedBorderColor = Border,
                focusedBorderColor = Teal
            ),
            singleLine = true
        )
    }
}

@Composable
fun LogCard(logs: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Box(Modifier.padding(16.dp).heightIn(min = 100.dp)) {
            Text(
                logs,
                fontSize = 13.sp,
                fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                color = TextSecondary,
                lineHeight = 18.sp
            )
        }
    }
}
