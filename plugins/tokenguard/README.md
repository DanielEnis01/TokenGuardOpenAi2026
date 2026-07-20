# TokenGuard Codex Plugin

This plugin installs a Codex pre-edit hook. Before Codex applies a file patch,
the hook asks the local TokenGuard daemon whether the edit is allowed.

If automatic spiral stopping is enabled and a file reaches the configured
repeated-edit limit, TokenGuard denies the patch before it is written. If the
daemon is unavailable, the hook fails open so it never blocks normal work just
because monitoring is offline.

The plugin requires the TokenGuard daemon to be running locally on port 47291,
or at the address supplied in `TG_DAEMON_URL`.
