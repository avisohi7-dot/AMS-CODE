import Foundation

struct Tag: Identifiable, Codable, Equatable, Hashable {
    let id: UUID
    var name: String
    var category: ItemCategory

    init(id: UUID = UUID(), name: String, category: ItemCategory) {
        self.id = id
        self.name = name
        self.category = category
    }
}
