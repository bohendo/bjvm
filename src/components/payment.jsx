
import React from 'react';
import Web3 from 'web3';

// Stupid temporary web3 stub
if (typeof(window) === 'undefined') {
  global.web3 = {
    eth: { getAccounts: ()=>{} },
    providers: { HttpProvider: ()=>{} },
    currentProvider: {}
  }
}

export default class Payment extends React.Component { 

  constructor(props) {
    super(props)
    this.state = {
      dealerAddr: this.props.dealerAddr,
      dealerBal: this.props.dealerBal,
      playerAddr: this.props.playerAddr || 'Login to MetaMask to cashout',
    }
  }

  componentDidMount() {

    if (typeof(web3) === 'undefined') {
      console.log('Couldn\'t find built-in web3 instance, falling back to localhost:8545...')
      web3 = new Web3(new Web3.providers.HttpProvider('localhost:8545'))
    } else {
      console.log(`Found built-in web3 instance!`)
      web3 = new Web3(web3.currentProvider)
    }
    this.refresh()
  }

  cashout() {
    this.props.cashout()
  }

  refresh() {
    this.props.refresh()
    web3.eth.getAccounts().then((res) => {
      if (res && res[0] && res[0].length === 42) {
        this.setState({ playerAddr: res[0] })
        fetch(`/api/register?addr=${res[0]}`, { credentials: 'same-origin' })
      }
    }).catch(error => {
      console.log(`web3.eth: Error connecting to ${web3.currentProvider}`)
      console.log(`web3.eth: ${error}`)
    })
  }

  render() {

    ////////////////////////////////////////
    // Props & Magic Numbers

    const x = (n) => Number(this.props.x)+Number(this.props.w)*n/100;
    const y = (n) => Number(this.props.y)+Number(this.props.h)*n/100;
    const w = (n) => Number(this.props.w)*n/100;
    const h = (n) => Number(this.props.h)*n/100;

    const fs = 18; // fs for Font Size

    return (
<g>

  <rect x={x(0)} y={y(0)} width={w(100)} height={h(100)}
        rx="5" ry="5" fill="#6f6" stroke="#000"/>


  <rect x={x(5)} y={y(5)} width={w(90)} height={h(35)}
        rx="5" ry="5" fill="#dfd" stroke="#000"/>

  <text x={x(10)} y={y(15)} fontSize="16">Dealer Address:</text>
  <text x={x(10)} y={y(22.5)} fontSize="10" textLength={w(80)}>
    {this.props.dealerAddr}</text>


  <text x={x(10)} y={y(32.5)} fontSize="16" textLength={w(80)}>
    Dealer Balance: {this.props.dealerBal} mETH
  </text>

  <rect x={x(5)} y={y(47.5)} width={w(90)} height={h(30)}
        rx="5" ry="5" fill="#dfd" stroke="#000"/>

  <text x={x(10)} y={y(57.5)} fontSize="16">
    Your MetaMask Address:
  </text>
  <text x={x(10)} y={y(67.5)} fontSize="10" textLength={w(80)}>
    {this.state.playerAddr}
  </text>

  <g onClick={()=>this.refresh()}>
    <rect x={x(5)} y={y(80)} width={w(42.5)} height={h(15)}
          rx="5" ry="5" fill="#dfd" stroke="#000"/>
    <text x={x(12)} y={y(90)} fontSize="20" pointerEvents="none">Refresh</text>
  </g>

  <g onClick={()=>this.cashout()}>
    <rect x={x(52.5)} y={y(80)} width={w(42.5)} height={h(15)}
          rx="5" ry="5" fill="#dfd" stroke="#000"/>
    <text x={x(56)} y={y(90)} fontSize="20" pointerEvents="none">Cash Out</text>
  </g>


</g>
    )
  }
}

