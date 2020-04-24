import { MensagemView, NegociacoesView } from '../views/index';
import { Negociacoes, Negociacao, NegociacaoParcial } from '../models/index';
import { domInject, throttle } from '../helpers/decorators/index'
import { NegociacaoService } from '../services/index'
import { imprime } from '../helpers/index'

export class NegociacaoController {

  @domInject('#data')
  private _inputData: JQuery;
  
  @domInject('#quantidade')
  private _inputQuantidade: JQuery;

  @domInject('#valor')
  private _inputValor: JQuery;

  private _negociacoes = new Negociacoes()
  private _negociacoesView = new NegociacoesView('#negociacoesView', true)
  private _mensagemView = new MensagemView('#mensagemView')

  private _service = new NegociacaoService()

  constructor() {
    
    this._negociacoesView.update(this._negociacoes)
  }

  adiciona(event: Event) {

    event.preventDefault()

    let data = new Date(this._inputData.val().replace(/-/g, ','))
    if (!this._ehDiaUtil(data)) {

        this._mensagemView.update('Somente são autorizadas negociações em dias úteis.')
        return;
    }

    const negociacao = new Negociacao(
      data,
      parseInt(this._inputQuantidade.val()),
      parseFloat(this._inputValor.val())
    )

    this._negociacoes.adiciona(negociacao)

    imprime(negociacao, this._negociacoes)

    this._negociacoesView.update(this._negociacoes)
    this._mensagemView.update('Negociação adicionada com sucesso.') 
  }

  private _ehDiaUtil(data: Date): boolean {
    return data.getDay() != diaDaSemana.Sabado && data.getDay() != diaDaSemana.Domingo
  }

  @throttle()
  importaDados() {

    function isOk(res: Response) {

      if (res.ok) {
        return res
      } else {
        throw new Error(res.statusText)
      }
    }

    this._service
      .obterNegociacoes(isOk)
      .then(negociacoesParaImportar => {

        const negociacoesJaImportadas = this._negociacoes.paraArray()

        negociacoesParaImportar
          .filter(negociacao => 
            !negociacoesJaImportadas.some(jaImportada => 
              negociacao.ehIgual(jaImportada)))
          .forEach(negociacao => 
          this._negociacoes.adiciona(negociacao))

        this._negociacoesView.update(this._negociacoes)
      })
      .catch(err => {
        this._mensagemView.update(err.message)
      })    
  }
}

enum diaDaSemana {

  Domingo,
  Segunda,
  Terca,
  Quarta,
  Quinta,
  Sexta,
  Sabado
}