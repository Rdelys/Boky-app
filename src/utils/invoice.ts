import * as FileSystem from 'expo-file-system'; // SDK 54+ : 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing';

/** Télécharge le PDF puis ouvre la feuille système (Enregistrer / Ouvrir / Partager). */
export async function downloadInvoice(url: string, name: string): Promise<boolean> {
  try {
    const fileUri = `${FileSystem.documentDirectory}facture-${name}.pdf`;
    const { uri, status } = await FileSystem.downloadAsync(url, fileUri);
    if (status !== 200) return false;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    }
    return true;
  } catch {
    return false;
  }
}