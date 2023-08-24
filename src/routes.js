import { Router } from "express";
import tableController from './app/controllers/tableController.js';

const router = Router()


//ROTAS
router.get('/contas', tableController.listAccounts); //listar todas as contas bancárias /contas?senha_banco=Cubos123Bank 
router.post('/contas', tableController.createAccount); //criar conta
router.put('/contas/:numeroConta/usuario', tableController.updateAccount); //atualizar conta
router.delete('/contas/:numeroConta', tableController.deleteAccount); //excluir conta
router.post('/transacoes/depositar', tableController.deposit); //depositar 
router.post('/transacoes/sacar', tableController.withdraw); //sacar
router.post('/transacoes/transferir', tableController.transfer); //transferir
router.get('/contas/saldo', tableController.checkBalance); //saldo da conta /saldo?numero_conta=123&senha=123
router.get('/contas/extrato', tableController.getStatement); //extrato /extrato?numero_conta=123&senha=12


export default router;

/*
Criar conta bancária - ok
Listar contas bancárias - ok
Atualizar os dados do usuário da conta bancária - ok
Excluir uma conta bancária - ok
Depósitar em uma conta bancária - ok
Sacar de uma conta bancária - ok
Transferir valores entre contas bancárias - ok
Consultar saldo da conta bancária - x
Emitir extrato bancário - x

*/