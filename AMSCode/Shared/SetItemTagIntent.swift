import AppIntents
import Foundation

/// Runs when a tag is picked from the tag dropdown (Menu) on a widget row.
struct SetItemTagIntent: AppIntent {
    static var title: LocalizedStringResource = "Set Item Tag"
    static var description = IntentDescription("Reassigns a study or task item to a different tag.")

    @Parameter(title: "Item ID")
    var itemID: String

    /// Empty string means "no tag".
    @Parameter(title: "Tag ID")
    var tagID: String

    init() {
        self.itemID = ""
        self.tagID = ""
    }

    init(itemID: String, tagID: UUID?) {
        self.itemID = itemID
        self.tagID = tagID?.uuidString ?? ""
    }

    func perform() async throws -> some IntentResult {
        ItemStore.shared.refresh()
        guard let itemUUID = UUID(uuidString: itemID) else { return .result() }
        ItemStore.shared.setTag(id: itemUUID, tagID: UUID(uuidString: tagID))
        return .result()
    }
}
