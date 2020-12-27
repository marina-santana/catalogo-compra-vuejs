const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: false,
    carrinho: [],
    carrinhoAtivo: false,
    mensagemAlerta: "Item adicionado",
    alertaAtivo: false,
  },
  filters: {
    numeroPreco(valor) {
      return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
  },
  computed: {
    carrinhoTotal() {
      let total = 0;
      if (this.carrinho.length) {
        this.carrinho.forEach(item => {
          total += item.preco;
        })
      }
      return total;
    }
  },
  methods: {
    fetchProdutos() {
      fetch("./api/produtos.json")
        .then(r => r.json())
        .then(r => {
          this.produtos = r;
        })
    },
    fetchProduto(id) {
      fetch(`./api/produtos/${id}/dados.json`)
        .then(r => r.json())
        .then(r => {
          this.produto = r;
        })
    },
    abrirModal(id) {
      this.fetchProduto(id);
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      })
    },
    fecharModal({ target, currentTarget }) {
      if (target === currentTarget) this.produto = false;
    },
    clickForaCarrinho({ target, currentTarget }) {
      if (target === currentTarget) this.carrinhoAtivo = false;
    },
    adicionarItem() {
      this.produto.estoque--;
      const { id, nome, preco, estoque } = this.produto;
      const verificaSeProdutoJaEstaAdicionado = this.carrinho.some(item => item.nome == nome);

      if(verificaSeProdutoJaEstaAdicionado > 0){
        let produto =  this.carrinho.find(item => item.nome == nome);        
        produto = {...produto, quantidade: produto.quantidade++, estoque: produto.estoque--}

        console.log(estoque);
        
        this.carrinho.push(produto);
        this.removerProduto(produto)
      }else{
        this.carrinho.push({ id, nome, preco, quantidade: 1, estoque});
      }
      
      this.alerta(`${nome} adicionado ao carrinho.`);
    },
    adicionarUnidade(index) {
      let produto = this.carrinho[index];
      produto = {...produto, quantidade: produto.quantidade++, estoque: produto.estoque--}
      this.carrinho.push(produto)
      this.removerProduto(produto)
    },
    removerItem(index) {
      this.carrinho.splice(index, 1);
    },
    removerUnidade(index) {
      let produto = this.carrinho[index];
      produto = {...produto, quantidade: produto.quantidade--, estoque: produto.estoque++}
      this.carrinho.push(produto)
      this.removerProduto(produto)
    },
    removerProduto(produto) {
      let index =  this.carrinho.indexOf(produto);
      if (index !== -1) {
        this.carrinho.splice(index, 1);
      }
    },
    checarLocalStorage() {
      if (window.localStorage.carrinho)
        this.carrinho = JSON.parse(window.localStorage.carrinho);
    },
    compararEstoque() {
      const item = this.carrinho.find(({ id }) => id === this.produto.id);
      this.produto.estoque -= item.quantidade;    
    },
    alerta(mensagem) {
      this.mensagemAlerta = mensagem;
      this.alertaAtivo = true;
      setTimeout(() => {
        this.alertaAtivo = false;
      }, 1500);
    },
    router() {
      const hash = document.location.hash;
      if (hash)
        this.fetchProduto(hash.replace("#", ""));
    }
  },
  watch: {
    produto() {
      document.title = this.produto.nome || "Techno";
      const hash = this.produto.id || "";
      history.pushState(null, null, `#${hash}`);
      if (this.produto) {
        this.compararEstoque();
      }
    },
    carrinho() {
      window.localStorage.carrinho = JSON.stringify(this.carrinho);
    }
  },
  created() {
    this.fetchProdutos();
    this.router();
    this.checarLocalStorage();
  }
})