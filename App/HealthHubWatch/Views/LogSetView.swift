import SwiftUI

struct LogSetView: View {
    @Environment(\.dismiss) private var dismiss
    var onSave: (String, Int, Double) -> Void

    @State private var exerciseName = ActivityCatalog.commonExercises.first!
    @State private var reps = 10
    @State private var weightKg: Double = 20

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Picker("Exercise", selection: $exerciseName) {
                    ForEach(ActivityCatalog.commonExercises, id: \.self) { name in
                        Text(name).tag(name)
                    }
                }
                .pickerStyle(.navigationLink)

                Stepper("Reps: \(reps)", value: $reps, in: 1...50)
                Stepper("Weight: \(Int(weightKg)) kg", value: $weightKg, in: 0...300, step: 2.5)

                Button("Save") {
                    onSave(exerciseName, reps, weightKg)
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
            }
            .padding()
        }
        .navigationTitle("Log Set")
    }
}
