import SwiftUI
import SwiftData

@main
struct HealthHubApp: App {
    @StateObject private var health = HealthKitManager.shared
    @StateObject private var connectivity: PhoneConnectivityManager
    let modelContainer: ModelContainer

    init() {
        do {
            modelContainer = try ModelContainer(for: GymSession.self, ExerciseEntry.self, SetEntry.self, Goal.self, NutritionEntry.self)
        } catch {
            fatalError("Failed to create model container: \(error)")
        }
        _connectivity = StateObject(wrappedValue: PhoneConnectivityManager(modelContext: modelContainer.mainContext))
    }

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environmentObject(health)
                .environmentObject(connectivity)
                .task {
                    await health.requestAuthorization()
                }
        }
        .modelContainer(modelContainer)
    }
}
