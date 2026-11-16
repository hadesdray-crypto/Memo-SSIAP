package PACKAGE_ICI;

import android.app.Activity;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/* Capteurs de la ronde : baromètre (étages) et lecture d'étiquettes NFC (pointeaux). Aucun réseau, aucune donnée ne sort du téléphone. */
@CapacitorPlugin(name = "RondeCapteurs")
public class RondeCapteursPlugin extends Plugin implements SensorEventListener, NfcAdapter.ReaderCallback {
    private SensorManager sm;
    private PluginCall nfcCall;
    private final Handler main = new Handler(Looper.getMainLooper());
    private Runnable delai;

    @PluginMethod
    public void demarrerPression(PluginCall call) {
        sm = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        Sensor baro = sm == null ? null : sm.getDefaultSensor(Sensor.TYPE_PRESSURE);
        if (baro == null) { call.reject("Pas de baromètre sur ce téléphone"); return; }
        sm.unregisterListener(this);
        sm.registerListener(this, baro, SensorManager.SENSOR_DELAY_NORMAL);
        call.resolve();
    }

    @PluginMethod
    public void arreterPression(PluginCall call) {
        if (sm != null) sm.unregisterListener(this);
        call.resolve();
    }

    @Override
    public void onSensorChanged(SensorEvent e) {
        if (e.values == null || e.values.length == 0) return;
        JSObject o = new JSObject();
        o.put("hpa", e.values[0]);
        notifyListeners("pression", o);
    }

    @Override
    public void onAccuracyChanged(Sensor s, int a) { }

    @PluginMethod
    public void nfcLire(PluginCall call) {
        Activity a = getActivity();
        NfcAdapter n = a == null ? null : NfcAdapter.getDefaultAdapter(a);
        if (n == null || !n.isEnabled()) { call.reject("NFC indisponible ou désactivé"); return; }
        if (nfcCall != null) { nfcCall.reject("Lecture déjà en cours"); }
        nfcCall = call;
        n.enableReaderMode(a, this,
            NfcAdapter.FLAG_READER_NFC_A | NfcAdapter.FLAG_READER_NFC_B | NfcAdapter.FLAG_READER_NFC_F | NfcAdapter.FLAG_READER_NFC_V | NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK,
            null);
        delai = () -> fin(null, "Aucune étiquette lue");
        main.postDelayed(delai, 20000);
    }

    @Override
    public void onTagDiscovered(Tag tag) {
        byte[] id = tag.getId();
        StringBuilder sb = new StringBuilder();
        if (id != null) for (byte b : id) sb.append(String.format("%02x", b));
        fin(sb.toString(), null);
    }

    private void fin(String uid, String erreur) {
        main.post(() -> {
            if (delai != null) { main.removeCallbacks(delai); delai = null; }
            Activity a = getActivity();
            try { if (a != null) { NfcAdapter n = NfcAdapter.getDefaultAdapter(a); if (n != null) n.disableReaderMode(a); } } catch (Exception ignore) { }
            PluginCall c = nfcCall; nfcCall = null;
            if (c == null) return;
            if (uid != null) { JSObject o = new JSObject(); o.put("uid", uid); c.resolve(o); } else c.reject(erreur == null ? "Erreur" : erreur);
        });
    }

    @Override
    protected void handleOnDestroy() {
        if (sm != null) sm.unregisterListener(this);
        super.handleOnDestroy();
    }
}
