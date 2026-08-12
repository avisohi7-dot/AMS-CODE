import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "heart.text.square.fill") }
            WorkoutsListView()
                .tabItem { Label("Workouts", systemImage: "figure.strengthtraining.traditional") }
            GoalsListView()
                .tabItem { Label("Goals", systemImage: "target") }
            NutritionView()
                .tabItem { Label("Nutrition", systemImage: "fork.knife") }
            SettingsView()
                .tabItem { Label("Settings", systemImage: "gearshape.fill") }
        }
    }
}
