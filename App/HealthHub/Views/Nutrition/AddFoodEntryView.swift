import SwiftUI
import SwiftData

struct AddFoodEntryView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var foodName = ""
    @State private var calories: Double = 0
    @State private var protein: Double = 0
    @State private var carbs: Double = 0
    @State private var fat: Double = 0
    @State private var date = Date.now

    var body: some View {
        NavigationStack {
            Form {
                TextField("Food", text: $foodName)
                DatePicker("When", selection: $date)
                HStack {
                    Text("Calories")
                    Spacer()
                    TextField("kcal", value: $calories, format: .number).keyboardType(.decimalPad).multilineTextAlignment(.trailing)
                }
                HStack {
                    Text("Protein (g)")
                    Spacer()
                    TextField("g", value: $protein, format: .number).keyboardType(.decimalPad).multilineTextAlignment(.trailing)
                }
                HStack {
                    Text("Carbs (g)")
                    Spacer()
                    TextField("g", value: $carbs, format: .number).keyboardType(.decimalPad).multilineTextAlignment(.trailing)
                }
                HStack {
                    Text("Fat (g)")
                    Spacer()
                    TextField("g", value: $fat, format: .number).keyboardType(.decimalPad).multilineTextAlignment(.trailing)
                }
            }
            .navigationTitle("Add Food")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }.disabled(foodName.isEmpty)
                }
            }
        }
    }

    private func save() {
        let entry = NutritionEntry(date: date, foodName: foodName, calories: calories, proteinG: protein, carbsG: carbs, fatG: fat)
        modelContext.insert(entry)
        dismiss()
    }
}
