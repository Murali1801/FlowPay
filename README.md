# FlowPay SMS Relay (Android)

1. Install [Android Studio](https://developer.android.com/studio).
2. **File → Open** and select this `android` folder.
3. Wait for Gradle sync, connect a phone with USB debugging (or use an emulator).
4. Run the **app** configuration.
5. In the app, set **Webhook URL** to your public API, e.g. `https://abc.ngrok.io/api/webhook/sms-sync`, and the **Bearer token** matching `WEBHOOK_BEARER_TOKEN` in `backend/.env`.
6. Grant **SMS** permission when prompted; send a test SMS or wait for a bank SMS that matches the parser.

Logs: filter Logcat by tag `FlowPaySms`.
