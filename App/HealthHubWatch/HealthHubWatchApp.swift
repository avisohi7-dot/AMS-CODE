import SwiftUI

@main
struct HealthHubWatchApp: App {
    @StateObject private var health = HealthKitManager.shared
    @StateObject private var workoutManager = WorkoutManager()
    @StateObject private var connectivity = WatchConnectivityManager()

    var body: some Scene {
        WindowGroup {
            NavigationStack {
                StartWorkoutView()
            }
            .environmentObject(health)
            .environmentObject(workoutManager)
            .environmentObject(connectivity)
            .task {
                await health.requestAuthorization()
            }
        }
    }
}
