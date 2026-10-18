/**
 * Envia o estado atual do simulador para a tabela luzsmart_estado
 * usando a função RPC já utilizada pela dashboard.
 *
 * Este arquivo não depende de Node.js nem de uma biblioteca externa.
 * A chave aqui deve ser a Publishable/anon key, nunca service_role/secret.
 */
(function () {
  const config = window.LUZSMART_SUPABASE_CONFIG || {};
  const projectUrl = String(config.url || "").trim().replace(/\\/+$/, "");
  const publishableKey = String(config.publishableKey || "").trim();

  const configured =
    projectUrl.startsWith("https://") &&
    !projectUrl.includes("COLE_AQUI") &&
    publishableKey.length > 10 &&
    !publishableKey.includes("COLE_AQUI");

  let lastSentSignature = "";
  let pendingState = null;
  let sending = false;
  let lastErrorAt = 0;
  let configWarningShown = false;

  function normalizedState(state) {
    if (!state || !Array.isArray(state.pirStates) || !Array.isArray(state.poleIntensities)) {
      return null;
    }
    if (state.pirStates.length !== 6 || state.poleIntensities.length !== 6) {
      return null;
    }

    return {
      ldrValue: Math.max(0, Math.min(4095, Math.round(Number(state.ldrValue) || 0))),
      pirStates: state.pirStates.map(Boolean),
      poleIntensities: state.poleIntensities.map((value) =>
        Math.max(0, Math.min(100, Math.round(Number(value) || 0)))
      )
    };
  }

  async function sendToSupabase(state) {
    const response = await fetch(projectUrl + "/rest/v1/rpc/atualizar_estado_luzsmart", {
      method: "POST",
      headers: {
        "apikey": publishableKey,
        "Authorization": "Bearer " + publishableKey,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        p_ldr_value: state.ldrValue,
        p_pir_states: state.pirStates,
        p_pole_intensities: state.poleIntensities
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error("Supabase respondeu HTTP " + response.status + (detail ? ": " + detail.slice(0, 250) : ""));
    }
  }

  async function flushQueue() {
    if (sending) return;
    sending = true;

    try {
      while (pendingState) {
        const state = pendingState;
        pendingState = null;
        const signature = JSON.stringify(state);
        if (signature === lastSentSignature) continue;

        await sendToSupabase(state);
        lastSentSignature = signature;
      }
    } catch (error) {
      const now = Date.now();
      if (now - lastErrorAt > 5000) {
        console.error("[LuzSmart/Supabase] Não foi possível enviar a telemetria:", error);
        lastErrorAt = now;
      }
    } finally {
      sending = false;
      if (pendingState) void flushQueue();
    }
  }

  window.LuzSmartSupabaseSync = {
    publish(snapshot) {
      if (!configured) {
        if (!configWarningShown) {
          console.info("[LuzSmart/Supabase] Configure js/supabase-config.js com o Project URL e a Publishable key para ativar a sincronização.");
          configWarningShown = true;
        }
        return;
      }

      const state = normalizedState(snapshot);
      if (!state) return;

      if (JSON.stringify(state) === lastSentSignature && !pendingState) return;
      pendingState = state;
      void flushQueue();
    }
  };
})();
