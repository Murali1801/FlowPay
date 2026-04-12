package com.flowpay.sync.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flowpay.sync.network.OrderRow
import com.flowpay.sync.network.StatsResponse
import com.flowpay.sync.ui.theme.*
import com.patrykandpatrick.vico.compose.axis.horizontal.rememberBottomAxis
import com.patrykandpatrick.vico.compose.axis.vertical.rememberStartAxis
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.component.shape.shader.verticalGradient
import com.patrykandpatrick.vico.core.chart.line.LineChart
import com.patrykandpatrick.vico.core.entry.FloatEntry
import com.patrykandpatrick.vico.core.entry.entryModelOf
import com.patrykandpatrick.vico.core.entry.entryOf

@Composable
fun DashboardScreen(stats: StatsResponse?, recentOrders: List<OrderRow>) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                "Performance Snapshot",
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0F172A)
            )
        }

        item {
            KpiGrid(stats)
        }

        item {
            ChartCard(recentOrders)
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Recent Orders", fontWeight = FontWeight.Bold, color = TextSecondary)
                TextButton(onClick = { /* Navigate to All */ }) {
                    Text("View All", color = Teal, fontWeight = FontWeight.Bold)
                }
            }
        }

        if (recentOrders.isEmpty()) {
            item {
                Text("No matching transactions captured yet.", color = TextSecondary, fontSize = 14.sp)
            }
        } else {
            items(recentOrders.take(5)) { order ->
                OrderListItem(order)
            }
        }
    }
}

@Composable
fun KpiGrid(stats: StatsResponse?) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            KpiCard("GMV (Paid)", stats?.totalPaidAmount ?: "₹0.00", Icons.Default.TrendingUp, Teal, Modifier.weight(1f))
            KpiCard("Success Rate", "98%", Icons.Default.CheckCircle, Green, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            KpiCard("Total Orders", stats?.totalOrders?.toString() ?: "0", Icons.Default.ShoppingCart, Indigo, Modifier.weight(1f))
            KpiCard("Pending", stats?.pending?.toString() ?: "0", Icons.Default.ClockLoaderToday, Orange, Modifier.weight(1f))
        }
    }
}

@Composable
fun KpiCard(label: String, value: String, icon: ImageVector, color: Color, modifier: Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            Spacer(Modifier.height(8.dp))
            Text(label, fontSize = 12.sp, color = TextSecondary)
            Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ChartCard(orders: List<OrderRow>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Column(Modifier.padding(16.dp)) {
            Text("Order Trend", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(Modifier.height(16.dp))
            
            val entries = remember(orders) {
                if (orders.isEmpty()) {
                    listOf(entryOf(0, 0))
                } else {
                    // Group by day (simplified: just take last 7 and count)
                    orders.take(20).groupBy { it.createdAt?.take(10) ?: "Today" }
                        .mapValues { it.value.size }
                        .toList()
                        .sortedBy { it.first }
                        .takeLast(7)
                        .mapIndexed { index, pair -> entryOf(index.toFloat(), pair.second.toFloat()) }
                }
            }
            
            val chartEntryModel = entryModelOf(entries)
            
            Chart(
                chart = lineChart(
                    lines = listOf(
                        LineChart.LineSpec(
                            lineColor = Teal.toArgb(),
                            lineBackgroundShader = verticalGradient(
                                colors = arrayOf(Teal.copy(alpha = 0.2f), Teal.copy(alpha = 0f))
                            )
                        )
                    )
                ),
                model = chartEntryModel,
                startAxis = rememberStartAxis(),
                bottomAxis = rememberBottomAxis(),
                modifier = Modifier.height(180.dp)
            )
        }
    }
}

// Extension to convert Compose Color to Int for Vico
fun Color.toArgb(): Int {
    return (this.alpha * 255).toInt() shl 24 or
           ((this.red * 255).toInt() shl 16) or
           ((this.green * 255).toInt() shl 8) or
           (this.blue * 255).toInt()
}

@Composable
fun OrderListItem(order: OrderRow) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Surface),
        elevation = CardDefaults.cardElevation(1.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(if (order.status == "Paid") Green.copy(alpha = 0.1f) else Orange.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    if (order.status == "Paid") Icons.Default.Check else Icons.Default.Timer,
                    contentDescription = null,
                    tint = if (order.status == "Paid") Green else Orange,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(Modifier.width(16.dp))
            Column(Modifier.weight(1f)) {
                Text(order.orderId.take(12) + "...", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                Text(order.createdAt ?: "Today", color = TextSecondary, fontSize = 12.sp)
            }
            Text("₹${order.amount}", fontWeight = FontWeight.ExtraBold, fontSize = 15.sp)
        }
    }
}
