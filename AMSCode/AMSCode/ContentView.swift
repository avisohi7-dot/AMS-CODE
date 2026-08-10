import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            ItemListView(category: .study, title: "Study", systemImage: "book.fill")
                .tabItem { Label("Study", systemImage: "book.fill") }

            ItemListView(category: .task, title: "Tasks", systemImage: "checklist")
                .tabItem { Label("Tasks", systemImage: "checklist") }
        }
    }
}

#Preview {
    ContentView()
}
