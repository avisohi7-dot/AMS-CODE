import SwiftUI
import SwiftData

struct NewGymSessionView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var health: HealthKitManager

    @State private var activityName = ActivityCatalog.workoutTypes.first!.name
    @State private var startDate = Date.now.addingTimeInterval(-3600)
    @State private var endDate = Date.now
    @State private var notes = ""
    @State private var syncToHealth = true

    var body: some View {
        NavigationStack {
            Form {
                Picker("Activity", selection: $activityName) {
                    ForEach(ActivityCatalog.workoutTypes, id: \.name) { entry in
                        Text(entry.name).tag(entry.name)
                    }
                }
                DatePicker("Start", selection: $startDate)
                DatePicker("End", selection: $endDate)
                TextField("Notes", text: $notes, axis: .vertical)
                Toggle("Save to Apple Health", isOn: $syncToHealth)
            }
            .navigationTitle("New Workout")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                }
            }
        }
    }

    private func save() {
        let session = GymSession(startDate: startDate, endDate: endDate, activityName: activityName, source: .manual, notes: notes)
        modelContext.insert(session)
        dismiss()

        if syncToHealth {
            Task {
                let workout = await health.saveWorkout(
                    activityType: ActivityCatalog.activityType(forName: activityName),
                    start: startDate,
                    end: endDate,
                    energyKcal: nil
                )
                session.healthKitWorkoutUUID = workout?.uuid
            }
        }
    }
}
