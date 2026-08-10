import AppIntents

/// Runs inside the widget extension process when a checkbox is tapped
/// directly on the Home Screen, so the app never has to launch.
struct ToggleItemIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Item"
    static var description = IntentDescription("Marks a study or task item as done or not done.")

    @Parameter(title: "Item ID")
    var itemID: String

    init() {
        self.itemID = ""
    }

    init(itemID: String) {
        self.itemID = itemID
    }

    func perform() async throws -> some IntentResult {
        ItemStore.shared.refresh()
        if let uuid = UUID(uuidString: itemID) {
            ItemStore.shared.toggle(id: uuid)
        }
        return .result()
    }
}
