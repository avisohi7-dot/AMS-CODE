import SwiftUI
import WidgetKit
import AppIntents

struct ChecklistRow: View {
    @Environment(\.widgetFamily) private var family
    let item: Item
    let availableTags: [Tag]

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter
    }()

    private var tagName: String {
        guard let tagID = item.tagID else { return "No tag" }
        return availableTags.first(where: { $0.id == tagID })?.name ?? "No tag"
    }

    private var dueDateText: String {
        guard let dueDate = item.dueDate else { return "Due date" }
        return Self.dateFormatter.string(from: dueDate)
    }

    private var isOverdue: Bool {
        guard let dueDate = item.dueDate, !item.isDone else { return false }
        return dueDate < Calendar.current.startOfDay(for: Date())
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Button(intent: ToggleItemIntent(itemID: item.id.uuidString)) {
                HStack(spacing: 6) {
                    Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(item.isDone ? .green : .secondary)
                    Text(item.title)
                        .font(.footnote)
                        .strikethrough(item.isDone)
                        .foregroundStyle(item.isDone ? .secondary : .primary)
                        .lineLimit(1)
                    Spacer(minLength: 0)
                }
            }
            .buttonStyle(.plain)

            if family != .systemSmall {
                HStack(spacing: 10) {
                    tagMenu
                    dueDateMenu
                    Spacer(minLength: 0)
                }
                .padding(.leading, 22)
            }
        }
    }

    private var tagMenu: some View {
        Menu {
            Button("No tag", intent: SetItemTagIntent(itemID: item.id.uuidString, tagID: nil))
            ForEach(availableTags) { tag in
                Button(tag.name, intent: SetItemTagIntent(itemID: item.id.uuidString, tagID: tag.id))
            }
        } label: {
            Label(tagName, systemImage: "tag")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
    }

    private var dueDateMenu: some View {
        Menu {
            Button("Today", intent: SetDueDateIntent(itemID: item.id.uuidString, daysFromToday: 0))
            Button("Tomorrow", intent: SetDueDateIntent(itemID: item.id.uuidString, daysFromToday: 1))
            Button("Next Week", intent: SetDueDateIntent(itemID: item.id.uuidString, daysFromToday: 7))
            Button("No Date", intent: SetDueDateIntent(itemID: item.id.uuidString, daysFromToday: nil))
        } label: {
            Label(dueDateText, systemImage: "calendar")
                .font(.caption2)
                .foregroundStyle(isOverdue ? .red : .secondary)
                .lineLimit(1)
        }
    }
}
