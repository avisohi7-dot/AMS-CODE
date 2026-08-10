import WidgetKit

struct ItemsEntry: TimelineEntry {
    let date: Date
    let items: [Item]
    let tags: [Tag]
}
