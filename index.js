const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.post('/webhook-shopify', async (req, res) => {
  const topic = req.headers['x-shopify-topic'] || '';

  // Produtos
  if (topic.startsWith('products')) {
    const { id, title, body_html, variants = [] } = req.body;
    await supabase.from('produtos').upsert({
      shopify_product_id: String(id),
      nome: title,
      descricao: body_html,
      preco_drop: Number(variants[0]?.price),
      preco_cd: Number(variants[0]?.compare_at_price) || Number(variants[0]?.price),
      valor_qualificado: Number(variants[0]?.price),
      ativo: true
    }, { onConflict: ['shopify_product_id'] });
  }

  // Pedidos
  if (topic.startsWith('orders')) {
    const { id, line_items, customer, total_price } = req.body;
    const consultorRef = (req.body.note_attributes || []).find(attr => attr.name === 'ref')?.value || null;
    const { data: pedido } = await supabase.from('pedidos').insert([{
      user_id: customer?.id?.toString(),
      fonte: consultorRef ? 'drop' : 'cd',
      consultor_ref: consultorRef,
      status: req.body.financial_status,
      criado_em: req.body.created_at
    }]).select();
    for (let item of line_items) {
      await supabase.from('order_items').insert([{
        order_id: pedido[0]?.id,
        id_do_produto: item.product_id?.toString(),
        qtd: item.quantity,
        preco_unidade: Number(item.price),
        valor_qualificado: Number(item.price),
      }]);
    }
  }
  res.sendStatus(200);
});

app.listen(4000, () => console.log('Webhook de Shopify rodando na porta 4000!'));
