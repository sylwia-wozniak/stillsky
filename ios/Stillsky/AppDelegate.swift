import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    return true
  }
}

// iOS 27 terminates apps built with its SDK that don't use the UIScene lifecycle,
// so the window is created here instead of in AppDelegate (see UIApplicationSceneManifest in Info.plist).
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene,
          let appDelegate = UIApplication.shared.delegate as? AppDelegate else { return }

    window = UIWindow(windowScene: windowScene)

    appDelegate.reactNativeFactory?.startReactNative(
      withModuleName: "Stillsky",
      in: window,
      initialProperties: initialProperties,
      launchOptions: nil
    )
  }
}

// The E2E configuration (a Release build with JavaScript bundled in) turns on the test helpers in
// JavaScript (App's `e2e` prop).
#if E2E
private let initialProperties: [AnyHashable: Any]? = ["e2e": true]
#else
private let initialProperties: [AnyHashable: Any]? = nil
#endif

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
