import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var health: HealthKitManager

    var body: some View {
        NavigationStack {
            Form {
                Section("Apple Health") {
                    LabeledContent("Status", value: health.isAuthorized ? "Connected" : "Not Connected")
                    Button("Request Access Again") {
                        Task { await health.requestAuthorization() }
                    }
                    Button("Refresh Data") {
                        Task { await health.refreshAll() }
                    }
                }
                Section("About") {
                    LabeledContent("App", value: "HealthHub")
                    Text("Log gym sessions, track live workouts from your Apple Watch, and see progress against your Health data — steps, heart rate, sleep, and weight — all in one place.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
        }
    }
}
