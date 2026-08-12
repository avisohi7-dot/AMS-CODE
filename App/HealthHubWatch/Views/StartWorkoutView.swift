import SwiftUI

struct StartWorkoutView: View {
    @EnvironmentObject private var workoutManager: WorkoutManager
    @State private var selectedActivity = ActivityCatalog.workoutTypes.first!.name
    @State private var isStarting = false

    var body: some View {
        List {
            Picker("Activity", selection: $selectedActivity) {
                ForEach(ActivityCatalog.workoutTypes, id: \.name) { entry in
                    Text(entry.name).tag(entry.name)
                }
            }
            .pickerStyle(.navigationLink)

            Button("Start Workout") {
                let type = ActivityCatalog.activityType(forName: selectedActivity)
                workoutManager.start(activityName: selectedActivity, activityType: type)
                isStarting = true
            }
            .buttonStyle(.borderedProminent)
        }
        .navigationTitle("HealthHub")
        .navigationDestination(isPresented: $isStarting) {
            LiveWorkoutView()
        }
    }
}
