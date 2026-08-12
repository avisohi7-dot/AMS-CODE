import SwiftUI
import SwiftData

struct WorkoutDetailView: View {
    @Bindable var session: GymSession
    @State private var newExerciseName = ""

    var body: some View {
        Form {
            Section("Overview") {
                LabeledContent("Activity", value: session.activityName)
                LabeledContent("Start", value: session.startDate.formatted(date: .abbreviated, time: .shortened))
                if let endDate = session.endDate {
                    LabeledContent("End", value: endDate.formatted(date: .abbreviated, time: .shortened))
                }
                LabeledContent("Duration", value: "\(Int(session.duration / 60)) min")
            }

            ForEach(session.exerciseEntries.sorted(by: { $0.order < $1.order })) { exercise in
                Section(exercise.name) {
                    ForEach(exercise.sets.sorted(by: { $0.timestamp < $1.timestamp })) { set in
                        Text("\(set.reps) reps @ \(formattedWeight(set.weightKg))")
                    }
                    Button("Add Set") {
                        let set = SetEntry(reps: 10, weightKg: 20)
                        set.exercise = exercise
                        exercise.sets.append(set)
                    }
                }
            }

            Section("Add Exercise") {
                Picker("Exercise", selection: $newExerciseName) {
                    Text("Select").tag("")
                    ForEach(ActivityCatalog.commonExercises, id: \.self) { name in
                        Text(name).tag(name)
                    }
                }
                Button("Add") {
                    guard !newExerciseName.isEmpty else { return }
                    let exercise = ExerciseEntry(name: newExerciseName, order: session.exerciseEntries.count)
                    exercise.session = session
                    session.exerciseEntries.append(exercise)
                    newExerciseName = ""
                }
            }

            Section("Notes") {
                TextEditor(text: $session.notes)
                    .frame(minHeight: 80)
            }
        }
        .navigationTitle(session.activityName)
    }

    private func formattedWeight(_ kg: Double) -> String {
        String(format: "%.1f kg", kg)
    }
}
