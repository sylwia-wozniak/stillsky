package com.stillsky

import android.content.Context
import android.preference.PreferenceManager
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Debug builds only: loads JavaScript from Metro through `adb reverse` (localhost) when it is set up.
 *
 * On an emulator React Native defaults to 10.0.2.2, which can take 16-22 s per bundle download,
 * while localhost through `adb reverse` takes about 5 s. Without `adb reverse`, the default stays.
 * A host chosen in the dev menu ("Change Bundle Location") is left alone.
 */
@Suppress("DEPRECATION") // React Native reads the host from the framework's default preferences
object DevServerHost {
  private const val PREF_KEY = "debug_http_host" // PackagerConnectionSettings.PREFS_DEBUG_SERVER_HOST_KEY
  private const val CONNECT_TIMEOUT_MS = 300

  fun preferAdbReverse(context: Context) {
    val port = context.resources.getInteger(com.facebook.react.R.integer.react_native_dev_server_port)
    val localhost = "localhost:$port"
    val prefs = PreferenceManager.getDefaultSharedPreferences(context)
    val current = prefs.getString(PREF_KEY, null)
    if (!current.isNullOrEmpty() && current != localhost) return

    if (isReachable(port)) {
      prefs.edit().putString(PREF_KEY, localhost).commit()
    } else {
      prefs.edit().remove(PREF_KEY).commit()
    }
  }

  /** Network calls are not allowed on the main thread, so connect on a short-lived one. */
  private fun isReachable(port: Int): Boolean {
    val reachable = AtomicBoolean(false)
    val probe = Thread {
      try {
        Socket().use { it.connect(InetSocketAddress("127.0.0.1", port), CONNECT_TIMEOUT_MS) }
        reachable.set(true)
      } catch (e: Exception) {
        // nothing listens on the port: no `adb reverse`
      }
    }
    probe.start()
    probe.join(CONNECT_TIMEOUT_MS + 200L)
    return reachable.get()
  }
}
