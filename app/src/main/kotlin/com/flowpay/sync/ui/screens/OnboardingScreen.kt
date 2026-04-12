package com.flowpay.sync.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flowpay.sync.ui.theme.*

@Composable
fun OnboardingScreen(onDismiss: () -> Unit) {
    var step by remember { mutableStateOf(0) }
    val steps = listOf(
        OnboardingStep(
            title = "Welcome to FlowPay 2.0",
            desc = "The all-in-one merchant hub for synchronizing SMS payments directly to your digital storefront.",
            icon = Icons.Default.Payments,
            color = Teal
        ),
        OnboardingStep(
            title = "Automatic Sync",
            desc = "FlowPay listens for bank SMS alerts and instantly marks matching orders as Paid via secure webhooks.",
            icon = Icons.Default.Sync,
            color = Indigo
        ),
        OnboardingStep(
            title = "Custom Logic",
            desc = "Define proprietary Regex rules to support any bank format globally. You have full control.",
            icon = Icons.Default.SettingsSuggest,
            color = Orange
        )
    )

    Surface(modifier = Modifier.fillMaxSize(), color = Surface) {
        Column(
            modifier = Modifier.padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            val current = steps[step]
            
            Box(
                modifier = Modifier
                    .size(100.dp)
                    .clip(CircleShape)
                    .background(current.color.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(current.icon, null, modifier = Modifier.size(48.dp), tint = current.color)
            }
            
            Spacer(Modifier.height(40.dp))
            
            Text(
                current.title,
                fontSize = 26.sp,
                fontWeight = FontWeight.ExtraBold,
                textAlign = TextAlign.Center,
                lineHeight = 32.sp
            )
            
            Spacer(Modifier.height(16.dp))
            
            Text(
                current.desc,
                fontSize = 15.sp,
                color = TextSecondary,
                textAlign = TextAlign.Center,
                lineHeight = 22.sp
            )
            
            Spacer(Modifier.height(60.dp))
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                steps.indices.forEach { i ->
                    Box(
                        modifier = Modifier
                            .size(if (i == step) 24.dp else 8.dp, 8.dp)
                            .clip(CircleShape)
                            .background(if (i == step) current.color else TextSecondary.copy(alpha = 0.3f))
                    )
                }
            }
            
            Spacer(Modifier.height(40.dp))
            
            Button(
                onClick = {
                    if (step < steps.size - 1) step++ else onDismiss()
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = current.color)
            ) {
                Text(if (step < steps.size - 1) "Next" else "Get Started", fontWeight = FontWeight.Bold)
            }
            
            if (step < steps.size - 1) {
                TextButton(onClick = onDismiss) {
                    Text("Skip", color = TextSecondary)
                }
            }
        }
    }
}

data class OnboardingStep(val title: String, val desc: String, val icon: ImageVector, val color: Color)
