import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://lhfnaatckhqtkckvcbuq.supabase.co',
  'sb_publishable_sYj9hsY-HuRtyU-DwEoTGA_DAUkc4qA'
)

export default async function Admin() {
  const { data } = await supabase
    .from('agendamentos')
    .select('*')
    .order('id', { ascending: false })

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Painel de Agendamentos</h1>

      <table border={1} cellPadding={10} style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((item) => (
            <tr key={item.id}>
              <td>{item.nome}</td>
              <td>{item.email}</td>
              <td>{item.telefone}</td>
              <td>{item.data}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}