import Foundation

enum ItemCategory: String, Codable {
    case study
    case task
}

struct Item: Identifiable, Codable, Equatable {
    let id: UUID
    var title: String
    var isDone: Bool
    var category: ItemCategory
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        isDone: Bool = false,
        category: ItemCategory,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.title = title
        self.isDone = isDone
        self.category = category
        self.createdAt = createdAt
    }
}
