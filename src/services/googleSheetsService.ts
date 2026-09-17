import type { RawRecord } from '../types';
import type { RawDataPayload } from './relationshipService';

const SPREADSHEET_ID = '1LvqrPR_KCD7WpZ-zr9Ow2YXIqIUYrh3dtKlGiBXX4FQ';

// Endpoint for public Google Sheets using Google Visualization API
const getSheetUrl = (sheetName: string) => 
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

/**
 * Fetches and parses a single sheet using the Google Visualization API.
 */
async function fetchSheet(sheetName: string): Promise<RawRecord[]> {
  const url = getSheetUrl(sheetName);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet: ${sheetName}`);
    }
    const text = await response.text();
    
    // The response text is wrapped in a function call, like:
    // /*O_o*/
    // google.visualization.Query.setResponse({"version":"0.6","reqId":"0","status":"ok","sig":"...","table":{...}});
    // We need to extract the JSON part.
    
    const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
    if (!jsonMatch || jsonMatch.length < 2) {
      throw new Error(`Invalid response format for sheet: ${sheetName}`);
    }
    
    const data = JSON.parse(jsonMatch[1]);
    
    if (data.status === 'error') {
      throw new Error(data.errors?.[0]?.message || 'Unknown error from Google Visualization API');
    }

    const table = data.table;
    const rows = table.rows;
    const cols = table.cols;

    // Extract headers
    let headers: string[] = cols.map((c: any) => c.label || '');
    let dataStartIndex = 0;

    const hasValidColsHeader = headers.includes('Prefixo') || headers.includes('Viatura') || headers.includes('Carimbo de data/hora');

    if (!hasValidColsHeader) {
      // Search in the first 5 rows for the real headers
      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const rowVals = rows[i].c.map((cell: any) => cell && cell.v !== null && cell.v !== undefined ? String(cell.v).trim() : '');
        if (rowVals.includes('Prefixo') || rowVals.includes('Viatura') || rowVals.includes('Carimbo de data/hora')) {
          // Found the header row!
          headers = rowVals.map((val: string, idx: number) => val || headers[idx] || '');
          dataStartIndex = i + 1;
          
          // Hardcoded fallback for missing headers in Cadastro_Revisoes due to merged cells
          if (sheetName === 'Cadastro_Revisoes') {
            if (!headers[13]) headers[13] = 'Data da Troca';
            if (!headers[14]) headers[14] = 'Km da troca';
            if (!headers[15]) headers[15] = 'Próxima Revisão (Km)';
            if (!headers[18]) headers[18] = 'Km para Próxima Revisão';
          }
          break;
        }
      }
    } else {
      // If we already had valid headers from cols, we still need to apply the fallback
      if (sheetName === 'Cadastro_Revisoes') {
        if (!headers[13]) headers[13] = 'Data da Troca';
        if (!headers[14]) headers[14] = 'Km da troca';
        if (!headers[15]) headers[15] = 'Próxima Revisão (Km)';
        if (!headers[18]) headers[18] = 'Km para Próxima Revisão';
      }
    }

    // Map rows to RawRecord
    const rawRecords: RawRecord[] = [];
    
    for (let index = dataStartIndex; index < rows.length; index++) {
      const row = rows[index];
      const values: Record<string, unknown> = {};
      let hasAnyValue = false;
      
      row.c.forEach((cell: any, colIndex: number) => {
        const header = headers[colIndex];
        if (header) {
          // cell.v is the raw value, cell.f is the formatted string value
          let val = cell ? (cell.v !== null && cell.v !== undefined ? cell.v : '') : '';
          
          if (typeof val === 'string' && val.startsWith('Date(')) {
            const parts = val.match(/Date\((\d+),(\d+),(\d+)/);
            if (parts) {
              const year = parts[1];
              const month = String(Number(parts[2]) + 1).padStart(2, '0');
              const day = parts[3].padStart(2, '0');
              val = `${day}/${month}/${year}`;
            }
          } else if (cell && cell.f && typeof cell.v === 'number' && sheetName === 'Cadastro_Revisoes' && (header === 'Data da Troca' || header === 'Km da troca' || header === 'Próxima Revisão (Km)' || header === 'Km para Próxima Revisão')) {
            // Keep original number for km, but prefer string format for dates if not captured above
            if (header === 'Data da Troca') val = cell.f;
          }
          
          values[header] = val;
          if (val !== '') hasAnyValue = true;
        }
      });

      if (hasAnyValue) {
        rawRecords.push({
          sourceSheet: sheetName,
          rowNumber: index + 2, // Assuming row 1 is index 0 in google API
          values,
        });
      }
    }

    return rawRecords;
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error);
    throw error; // Rethrow to handle it in the orchestrator
  }
}

export async function fetchAllData(): Promise<RawDataPayload> {
  const [
    cadastro,
    consolidado,
    abastecimentos,
    checklistsDiarios,
    checklistsSemanais,
    revisoes
  ] = await Promise.all([
    fetchSheet('Detalhamento_Viaturas'),
    fetchSheet('Consolidado_Frota'),
    fetchSheet('Historico_Abastecimentos'),
    fetchSheet('Checklist_Diario'),
    fetchSheet('Checklist_Semanal'),
    fetchSheet('Cadastro_Revisoes')
  ]);

  return {
    cadastro,
    consolidado,
    abastecimentos,
    checklistsDiarios,
    checklistsSemanais,
    revisoes
  };
}
