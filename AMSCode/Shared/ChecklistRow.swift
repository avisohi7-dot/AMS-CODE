import SwiftUI
import AppIntents

struct ChecklistRow: View {
    let item: Item

    var body: some View {
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
    }
}
