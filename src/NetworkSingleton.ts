// tslint:disable
import axios from 'axios';

export default class NetworkSingleton {
  static MAIN_URL = 'https://marketdata-backend.herokuapp.com';

  static stockList(
    success = (res: any) => {console.log(res)},
    failure = (err: any) => {console.log(err)}
  ){
        axios.get(`${this.MAIN_URL}/stocksList`)
        .then((res: any) => {
          success(res.data);
        })
        .catch((err: {response: any}) => {
          failure(err.response);
        });
  }

  static statistics(stock_symbol1, stock_symbol2, table_id1, table_id2,
    success = (res: any) => {console.log(res)},
    failure = (err: any) => {console.log(err)}
  ){
        axios.get(`${this.MAIN_URL}/statistics`, {
          headers: {
          "Content-Type": 'application/x-www-form-urlencoded',
          stock_symbol1,
          stock_symbol2,
          table_id1,
          table_id2,
        }})
        .then((res: any) => {
          if(res.data.err){
            failure(res);
          }else {
            success(res.data);
          }
        })
        .catch((err: {response: any}) => {
          failure(err.response);
        });
  }

  static stock(stock_symbol, table_id,
    success = (res: any) => {console.log(res)},
    failure = (err: any) => {console.log(err)}
  ){
        axios.get(`${this.MAIN_URL}/stock`, {
          headers: {
          "Content-Type": 'application/x-www-form-urlencoded',
          stock_symbol,
          table_id,
        }})
        .then((res: any) => {
          if(res.data.err){
            failure(res);
          }else {
            success(res.data);
          }
        })
        .catch((err: {response: any}) => {
          failure(err.response);
        });
  }

}
