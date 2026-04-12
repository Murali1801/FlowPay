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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flowpay.sync.data.ConfigManager
import com.flowpay.sync.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegexEditorScreen(config: ConfigManager, onBack: () -> Unit) {
    var enabled by remember { mutableStateOf(config.useCustomRegex) }
    var pattern by remember { mutableStateOf(config.customRegex) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Custom SMS Trigger", fontSize = 18.sp, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
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
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Surface),
                    elevation = CardDefaults.cardElevation(2.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text("Enable Custom Logic", fontWeight = FontWeight.Bold)
                            Text("Overrides default bank parsing", fontSize = 12.sp, color = TextSecondary)
                        }
                        Switch(
                            checked = enabled,
                            onCheckedChange = { enabled = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = Teal)
                        )
                    }
                }
            }

            item {
                Text("Regex Pattern", fontWeight = FontWeight.Bold, color = TextSecondary, fontSize = 13.sp)
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = pattern,
                    onValueChange = { pattern = it },
                    modifier = Modifier.fillMaxWidth().heightIn(min = 120.dp),
                    shape = RoundedCornerShape(12.dp),
                    placeholder = { Text("e.g. (?i)Amount (\\d+)") },
                    colors = OutlinedTextFieldDefaults.colors(
                        unfocusedBorderColor = Border,
                        focusedBorderColor = Teal,
                        unfocusedContainerColor = Surface,
                        focusedContainerColor = Surface
                    ),
                    textStyle = LocalTextStyle.current.copy(
                        fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                        fontSize = 14.sp
                    )
                )
            }

            item {
                InfoSection()
            }

            item {
                Button(
                    onClick = {
                        config.useCustomRegex = enabled
                        config.customRegex = pattern
                        onBack()
                    },
                    modifier = Modifier.fillMaxWidth().height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Teal)
                ) {
                    Text("Save & Apply Rule", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun InfoSection() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Indigo.copy(alpha = 0.05f)),
        border = androidx.compose.foundation.BorderStroke(1.dp, Indigo.copy(alpha = 0.1f))
    ) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Info, null, tint = Indigo, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(8.dp))
                Text("Pro Tip", color = Indigo, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            Spacer(Modifier.height(8.dp))
            Text(
                "Use capture groups ( ) to identify the numerical amount. Default: (?i)(?:Rs|INR|₹)\\.?\\s*([\\d,]+\\.?\\d*)",
                color = TextSecondary,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )
        }
    }
}
