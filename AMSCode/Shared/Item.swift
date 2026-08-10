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
    var tagID: UUID?
    var dueDate: Date?
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        isDone: Bool = false,
        category: ItemCategory,
        tagID: UUID? = nil,
        dueDate: Date? = nil,
        createdAt: Date = Date()
    ) {
        self.id = id
        self.title = title
        self.isDone = isDone
        self.category = category
        self.tagID = tagID
        self.dueDate = dueDate
        self.createdAt = createdAt
    }
}
