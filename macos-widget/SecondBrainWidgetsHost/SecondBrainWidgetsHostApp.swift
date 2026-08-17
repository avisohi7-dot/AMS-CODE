import SwiftUI

@main
struct SecondBrainWidgetsHostApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "brain.head.profile")
                .font(.system(size: 40))
            Text("Second Brain Widgets")
                .font(.title2.bold())
            Text("This app hosts your Second Brain OS widgets.\nAdd them from the Notification Center widget gallery — you can close this window afterwards.")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
                .font(.callout)
                .padding(.horizontal, 40)
        }
        .frame(width: 420, height: 260)
    }
}
