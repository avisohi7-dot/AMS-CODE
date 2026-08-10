import AppIntents
import Foundation

/// Runs when a preset is picked from the due-date dropdown (Menu) on a
/// widget row. Widgets can't host a real calendar picker, so this offers
/// quick presets; a custom date can still be set from within the app.
struct SetDueDateIntent: AppIntent {
    static var title: LocalizedStringResource = "Set Due Date"
    static var description = IntentDescription("Sets a quick due date preset for a study or task item.")

    @Parameter(title: "Item ID")
    var itemID: String

    /// Days from today's start-of-day; negative means "clear the due date".
    @Parameter(title: "Days From Today")
    var daysFromToday: Int

    init() {
        self.itemID = ""
        self.daysFromToday = -1
    }

    init(itemID: String, daysFromToday: Int?) {
        self.itemID = itemID
        self.daysFromToday = daysFromToday ?? -1
    }

    func perform() async throws -> some IntentResult {
        ItemStore.shared.refresh()
        guard let itemUUID = UUID(uuidString: itemID) else { return .result() }
        if daysFromToday < 0 {
            ItemStore.shared.setDueDate(id: itemUUID, dueDate: nil)
        } else {
            let startOfToday = Calendar.current.startOfDay(for: Date())
            let date = Calendar.current.date(byAdding: .day, value: daysFromToday, to: startOfToday)
            ItemStore.shared.setDueDate(id: itemUUID, dueDate: date)
        }
        return .result()
    }
}
