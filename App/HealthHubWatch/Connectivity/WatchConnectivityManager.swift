import Foundation
import WatchConnectivity

@MainActor
final class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    override init() {
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
    }

    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}

    func send(payload: WorkoutSyncPayload) {
        guard WCSession.default.activationState == .activated,
              let data = try? JSONEncoder().encode(payload) else { return }
        WCSession.default.transferUserInfo(["payload": data])
    }
}
