import banco from '../database/bancodedados.js';

class TableController {
  // Método para listar contas
  listAccounts(req, res) {
    const { senha_banco } = req.query;
    if (senha_banco !== banco.banco.senha) {
      return res.status(403).json({ mensagem: 'Senha do banco incorreta.' });
    }
    return res.json(banco.contas);
  }

  // Método para criar uma conta
  createAccount(req, res) {
    const criarConta = (conta) => {
      const openingBalance = 0;
      const user = { ...conta };
      const number = banco.contas.length + 1; // Defina o número com base no número de contas existentes
      const createUser = { number, saldo: openingBalance, user };
      banco.contas.push(createUser); // Adicione a nova conta a banco.contas
    };

    const novaConta = req.body;

    // Validações
    if (!novaConta || !novaConta.nome || !novaConta.cpf || !novaConta.email || !novaConta.senha) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    const contaExistente = banco.contas.find((conta) => conta.user.cpf === novaConta.cpf || conta.user.email === novaConta.email);
    if (contaExistente) {
      return res.status(400).json({ mensagem: 'Já existe uma conta com o CPF ou e-mail informado!' });
    }

    criarConta(novaConta);

    return res.status(201).json({ mensagem: 'Sua conta foi criada!' });
  }

  // Método para atualizar uma conta
  updateAccount(req, res) {
    const { numeroConta } = req.params;
    const dadosAtualizados = req.body;

    // Validações
    const contaExistente = banco.contas.find((conta) => conta.number === Number(numeroConta));
    if (!contaExistente) {
      return res.status(404).json({ mensagem: 'Conta não encontrada para atualização' });
    }

    if (dadosAtualizados.cpf || dadosAtualizados.email) {
      const contaDuplicada = banco.contas.find(
        (conta) => (dadosAtualizados.cpf && conta.user.cpf === dadosAtualizados.cpf) || (dadosAtualizados.email && conta.user.email === dadosAtualizados.email)
      );
      if (contaDuplicada && contaDuplicada.number !== Number(numeroConta)) {
        return res.status(400).json({ mensagem: 'Já existe uma conta com o CPF ou e-mail informado!' });
      }
    }

    // Atualize os dados da conta
    const indice = banco.contas.indexOf(contaExistente);
    banco.contas[indice] = { ...contaExistente, user: { ...contaExistente.user, ...dadosAtualizados } };

    return res.json({ mensagem: 'Conta atualizada com sucesso.' });
  }

  // Método para excluir uma conta
  deleteAccount(req, res) {
    const { numeroConta } = req.params;

    // Validações
    const contaExistente = banco.contas.find((conta) => conta.number === Number(numeroConta));
    if (!contaExistente) {
      return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    if (contaExistente.saldo !== 0) {
      return res.status(403).json({ mensagem: 'Não é possível excluir uma conta com saldo diferente de zero.' });
    }

    // Remova a conta de banco.contas
    banco.contas = banco.contas.filter((conta) => conta.number !== Number(numeroConta));

    return res.json({ mensagem: 'Conta excluída com sucesso.' });
  }

  // Métodos para transações bancárias

  // Método para realizar um depósito
  deposit(req, res) {
    const { numero_conta, valor } = req.body;

    // Validações
    if (!numero_conta || !valor || valor <= 0) {
      return res.status(400).json({ mensagem: 'Número de conta e valor do depósito são obrigatórios e devem ser maiores que zero.' });
    }

    const contaDestino = banco.contas.find((conta) => conta.number === Number(numero_conta));
    if (!contaDestino) {
      return res.status(404).json({ mensagem: 'Conta de destino não encontrada.' });
    }

    // Atualize o saldo da conta de destino
    contaDestino.saldo += valor;

    // Registre a transação de depósito
    banco.depositos.push({ numero_conta, valor });

    return res.json({ mensagem: 'Depósito realizado sucesso.' });
  }

  // Método para realizar um saque
  withdraw(req, res) {
    const { numero_conta, valor, senha } = req.body;

    // Validações
    if (!numero_conta || !valor || valor <= 0 || !senha) {
      return res.status(400).json({ mensagem: 'Número de conta, valor do saque e senha são obrigatórios e devem ser maiores que zero.' });
    }

    const conta = banco.contas.find((conta) => conta.number === Number(numero_conta));
    if (!conta) {
      return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    if (senha !== conta.user.senha) {
      return res.status(403).json({ mensagem: 'Senha incorreta.' });
    }

    if (conta.saldo < valor) {
      return res.status(403).json({ mensagem: 'Saldo insuficiente para saque.' });
    }

    // Atualize o saldo da conta
    conta.saldo -= valor;

    // Registre a transação de saque
    banco.saques.push({ numero_conta, valor });

    return res.json({ mensagem: 'Saque realizado com sucesso.' });
  }

  // Método para realizar uma transferência
  transfer(req, res) {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;

    // Validações
    if (!numero_conta_origem || !numero_conta_destino || !valor || valor <= 0 || !senha) {
      return res.status(400).json({ mensagem: 'Número de conta de origem, número de conta de destino, valor da transferência e senha são obrigatórios e devem ser maiores que zero.' });
    }

    const contaOrigem = banco.contas.find((conta) => conta.number === Number(numero_conta_origem));
    const contaDestino = banco.contas.find((conta) => conta.number === Number(numero_conta_destino));

    if (!contaOrigem || !contaDestino) {
      return res.status(404).json({ mensagem: 'Conta de origem ou destino não encontrada.' });
    }

    if (senha !== contaOrigem.user.senha) {
      return res.status(403).json({ mensagem: 'Senha incorreta.' });
    }

    if (contaOrigem.saldo < valor) {
      return res.status(403).json({ mensagem: 'Saldo insuficiente para transferência.' });
    }

    // Atualize os saldos das contas de origem e destino
    contaOrigem.saldo -= valor;
    contaDestino.saldo += valor;

    // Registre a transação de transferência
    banco.transferencias.push({ numero_conta_origem, numero_conta_destino, valor });

    return res.json({ mensagem: 'Transferência realizada com sucesso.' });
  }

  // Método para verificar o saldo de uma conta
  checkBalance(req, res) {
    const { numero_conta, senha } = req.query;

    // Validações
    if (!numero_conta || !senha) {
      return res.status(400).json({ mensagem: 'Número de conta e senha são obrigatórios.' });
    }

    const conta = banco.contas.find((conta) => conta.number === Number(numero_conta));

    if (!conta) {
      return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    if (senha !== conta.user.senha) {
      return res.status(403).json({ mensagem: 'Senha incorreta.' });
    }

    return res.json({ saldo: conta.saldo });
  }

  // Método para obter o extrato de uma conta
  getStatement(req, res) {
    const { numero_conta, senha } = req.query;

    // Validações
    if (!numero_conta || !senha) {
      return res.status(400).json({ mensagem: 'Número de conta e senha são obrigatórios.' });
    }

    const conta = banco.contas.find((conta) => conta.number === Number(numero_conta));

    if (!conta) {
      return res.status(404).json({ mensagem: 'Conta não encontrada.' });
    }

    if (senha !== conta.user.senha) {
      return res.status(403).json({ mensagem: 'Senha incorreta.' });
    }

    const extrato = {
      depositos: banco.depositos.filter((transacao) => transacao.numero_conta === numero_conta),
      saques: banco.saques.filter((transacao) => transacao.numero_conta === numero_conta),
      transferencias: banco.transferencias.filter(
        (transacao) => transacao.numero_conta_origem === numero_conta || transacao.numero_conta_destino === numero_conta
      ),
    };

    return res.json(extrato);
  }
}

export default new TableController();
