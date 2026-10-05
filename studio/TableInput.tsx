import {set, setIfMissing, type ObjectInputProps} from 'sanity';

type Row = {_type: 'trialTableRow'; _key: string; cells: string[]};
type Table = {_type: 'trialTable'; caption?: string; headers?: string[]; rows?: Row[]};

export function TableInput({value: inputValue, onChange, readOnly}: ObjectInputProps) {
  const value = inputValue as Table | undefined;
  const headers = value?.headers || [];
  const rows = value?.rows || [];
  const patch = (next: Partial<Table>) => onChange([
    setIfMissing({_type: 'trialTable'}),
    ...Object.entries(next).map(([field, data]) => set(data, [field])),
  ]);
  const changeCell = (row: Row, index: number, text: string) => onChange(set(text, ['rows', {_key: row._key}, 'cells', index]));
  const changeHeader = (index: number, text: string) => onChange(set(text, ['headers', index]));
  const addColumn = () => patch({headers: [...headers, `Column ${headers.length + 1}`], rows: rows.map((row) => ({...row, cells: [...row.cells, '']}))});
  const removeColumn = (index: number) => patch({headers: headers.filter((_, column) => column !== index), rows: rows.map((row) => ({...row, cells: row.cells.filter((_, column) => column !== index)}))});
  const inputStyle = {width: '100%', minWidth: 100, padding: 8, font: 'inherit'};
  return <fieldset disabled={readOnly} style={{border: 0, padding: 0, minWidth: 0}}>
    <label>Caption<input style={{...inputStyle, margin: '8px 0 16px'}} value={value?.caption || ''} onChange={(event) => patch({caption: event.currentTarget.value})} /></label>
    {headers.length > 0 && <div style={{overflowX: 'auto'}}><table style={{width: '100%', borderSpacing: 8}}><thead><tr>{headers.map((header, index) => <th key={index}><input aria-label={`Column ${index + 1} heading`} style={inputStyle} value={header} onChange={(event) => changeHeader(index, event.currentTarget.value)} /><button type="button" onClick={() => removeColumn(index)} aria-label={`Remove column ${index + 1}`}>Remove column</button></th>)}<th scope="col">Rows</th></tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={row._key}>{headers.map((_, columnIndex) => <td key={columnIndex}><input aria-label={`Row ${rowIndex + 1}, column ${columnIndex + 1}`} style={inputStyle} value={row.cells[columnIndex] || ''} onChange={(event) => changeCell(row, columnIndex, event.currentTarget.value)} /></td>)}<td><button type="button" aria-label={`Remove row ${rowIndex + 1}`} onClick={() => patch({rows: rows.filter((item) => item._key !== row._key)})}>Remove row</button></td></tr>)}</tbody></table></div>}
    <div style={{display: 'flex', gap: 12, marginTop: 12}}><button type="button" onClick={addColumn}>Add column</button><button type="button" disabled={!headers.length} onClick={() => patch({rows: [...rows, {_type: 'trialTableRow', _key: crypto.randomUUID(), cells: headers.map(() => '')}]})}>Add row</button></div>
  </fieldset>;
}
