import SwiftUI
import SwiftData

struct NutritionView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \NutritionEntry.date, order: .reverse) private var entries: [NutritionEntry]
    @State private var showingAddEntry = false

    private var todayEntries: [NutritionEntry] {
        let start = Calendar.current.startOfDay(for: .now)
        return entries.filter { $0.date >= start }
    }

    private var totals: (calories: Double, protein: Double, carbs: Double, fat: Double) {
        todayEntries.reduce((0, 0, 0, 0)) { acc, entry in
            (acc.0 + entry.calories, acc.1 + entry.proteinG, acc.2 + entry.carbsG, acc.3 + entry.fatG)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section("Today") {
                    LabeledContent("Calories", value: "\(Int(totals.calories)) kcal")
                    LabeledContent("Protein", value: "\(Int(totals.protein)) g")
                    LabeledContent("Carbs", value: "\(Int(totals.carbs)) g")
                    LabeledContent("Fat", value: "\(Int(totals.fat)) g")
                }
                Section("Log") {
                    ForEach(entries) { entry in
                        VStack(alignment: .leading) {
                            Text(entry.foodName).font(.subheadline)
                            Text("\(Int(entry.calories)) kcal · \(entry.date.formatted(date: .abbreviated, time: .shortened))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .onDelete(perform: delete)
                }
            }
            .navigationTitle("Nutrition")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingAddEntry = true } label: { Image(systemName: "plus") }
                }
            }
            .sheet(isPresented: $showingAddEntry) {
                AddFoodEntryView()
            }
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(entries[index])
        }
    }
}
