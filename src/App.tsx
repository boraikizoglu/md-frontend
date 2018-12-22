import * as React from 'react';
import NS from './NetworkSingleton';
import {
  Upload, message, Button, Icon, Select, Table,
} from 'antd';

import './App.css';
import 'antd/dist/antd.css';
import logo from './logo.svg';

interface IStockListElement{
  stocksymbol: string;
  table_id: number;
}

interface IStockList{
  [key: string]: IStockListElement;
}

interface IState {
  stocksList: IStockList;
  selectedStockID1: number;
  selectedStockID2: number;
  stock1SelectionOptions: IStockList;
  stock2SelectionOptions: IStockList;
  stdev1: number;
  stdev2: number;
  corr: number;
  loading: boolean;
  stockTable1Data: any;
  stockTable2Data: any;
  showStatistics: boolean;
  showTable: boolean;
}

const Option = Select.Option;

class App extends React.Component<{}, IState> {
  public constructor(props){
    super(props);
    this.state = {
      stocksList: {},
      selectedStockID1: null,
      selectedStockID2: null,
      stock1SelectionOptions: null,
      stock2SelectionOptions: null,
      stdev1: null,
      stdev2: null,
      corr: null,
      loading: false,
      showStatistics: false,
      stockTable1Data: null,
      stockTable2Data: null,
      showTable: false,
    };
  }

  public updateStockList(): void {
    NS.stockList((data) => {
      this.setState({stocksList: data.stocks, stock1SelectionOptions: data.stocks, stock2SelectionOptions: data.stocks});
    }, (err) => {
      if(err){
        console.log(err);
      }
    });
  }

  public componentDidMount(){
    this.updateStockList();
  }

  private uploadProps(thisComponent: any){
    return {
      name: 'file',
      action: `//localhost:3002/upload`,
      headers: {
        authorization: 'authorization-text',
      },
      onChange(info) {
        if (info.file.status !== 'uploading') {
          // console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          thisComponent.updateStockList();
          thisComponent.updateStockList();
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    };
  }

  public returnSelectionOptions(options: IStockList): any {
    if(options === null || options === undefined){
      return;
    }
    return Object.keys(options).map((currentIndex) => {
      const stockSymbol: String = options[`${currentIndex}`].stocksymbol;
      const table_id: number = options[`${currentIndex}`].table_id;
      return <Option key={currentIndex} value={table_id}>{`${stockSymbol}-${table_id}`}</Option>;
    });
  }

  public updateStatistics(){
    const { selectedStockID1, selectedStockID2, stock1SelectionOptions, stock2SelectionOptions } = this.state;
    if(selectedStockID1 === null || selectedStockID2 === null){
      message.error(`You need to select the datasets that will be compared`);
      return;
    }
    const stockSymbol1 = stock1SelectionOptions[`${selectedStockID1}`].stocksymbol;
    const stockSymbol2 = stock2SelectionOptions[`${selectedStockID2}`].stocksymbol;
    this.setState({loading: true});
    NS.statistics(stockSymbol1, stockSymbol2, selectedStockID1, selectedStockID2, (res) => {
      message.success(`Statistics are calculated successfully.`);
      this.setState({loading: false, stdev1: res.stdev1, stdev2: res.stdev2, corr: res.corr, showStatistics: true});
    }, (err) => {
      if(err){
        message.error(`An error occurred`);
        this.setState({loading: false});
        console.log(err);
      }
    });
  }

  public updateTable(){
    const { selectedStockID1, selectedStockID2, stocksList } = this.state;
    if(!selectedStockID1 || !selectedStockID2 || !stocksList){
      return null;
    }
    NS.stock(stocksList[`${selectedStockID1}`].stocksymbol, selectedStockID1, (res) => {
      NS.stock(stocksList[`${selectedStockID2}`].stocksymbol, selectedStockID2, (res2) => {
        this.setState({stockTable1Data: res, stockTable2Data: res2, showTable: true});
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
  }

  public onClickCalculate(){
    this.updateStatistics();
    this.updateTable();
  }

  public returnStatistics(){
    const { selectedStockID1, selectedStockID2, stdev1, stdev2, corr, stocksList, showStatistics } = this.state;
    if(!showStatistics){
      return null;
    }
    return (
      <div>
        <p>{`Standart deviation of ${stocksList[`${selectedStockID1}`].stocksymbol} ${stdev1.toFixed(5)}`}</p>
        <p>{`Standart deviation of ${stocksList[`${selectedStockID2}`].stocksymbol} ${stdev2.toFixed(5)}`}</p>
        <p>{`Correlation between datasets ${corr.toFixed(5)}`}</p>
      </div>
    );
  }

  public returnTable(tableData: any){
    const { showTable } = this.state;
    if(!showTable){
      return null;
    }

    const columns = [{
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    }, {
      title: 'Close',
      dataIndex: 'close',
      key: 'close',
    }, {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
    }];

    const dataSource = tableData.data.map((row, index) => {
      console.log(index, row);
      const change: string = index === 0 ? `${0}%` : `${((row.close - tableData.data[index-1].close) / tableData.data[index-1].close * 100).toFixed(3)}%`;
      return {
        key: index,
        date: row.date,
        close: row.close,
        change,
      };
    });

    return (
      <div style={{margin: '20px', width: '350px'}}>
        <b>{tableData.data[0].stocksymbol}</b>
        <Table dataSource={dataSource} columns={columns} />
      </div>);
  }

  public render() {
    const { stocksList, stock1SelectionOptions, stock2SelectionOptions, loading, stockTable1Data, stockTable2Data} = this.state;
    return (
      <div className="App2">
        <header className="App-header2">
          <img src={logo} className="App-logo2" alt="logo" />
          <h1 style={{color: 'white'}} className="App-title">Welcome to Market Data Application</h1>
        </header>
        <div className="App-intro2">
          <div style={{width: '50%'}}>
            <div style={{marginBottom: '10px'}}>
              <Upload {...this.uploadProps(this)}>
                <Button>
                  <Icon type="upload" /> Click to Upload
                </Button>
              </Upload>
            </div>
            <div>
            <Select
              showSearch
              style={{ width: 200, margin: 5}}
              placeholder="Select a stock symbol"
              optionFilterProp="children"
              onChange={(value: any) => {
                const copyOptions = JSON.parse(JSON.stringify(stocksList));
                delete copyOptions[`${value}`];
                this.setState({selectedStockID1: value, stock2SelectionOptions: copyOptions});
              }}
              onFocus={() => null}
              onBlur={() => null}
              // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {this.returnSelectionOptions(stock1SelectionOptions)}
            </Select>
            <Select
              showSearch
              style={{ width: 200, margin: 5}}
              placeholder="Select a stock symbol"
              optionFilterProp="children"
              onChange={(value: any) => {
                const copyOptions = JSON.parse(JSON.stringify(stocksList));
                delete copyOptions[`${value}`];
                this.setState({selectedStockID2: value, stock1SelectionOptions: copyOptions});
              }}
              onFocus={() => null}
              onBlur={() => null}
              // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {this.returnSelectionOptions(stock2SelectionOptions)}
            </Select>
            </div>
            <Button type="primary" style={{margin: 10}} loading={loading} onClick={() => {
              this.onClickCalculate();
            }}>
              Calculate Statistics
            </Button>
            {this.returnStatistics()}
            <div style={{display: 'flex'}}>
              {this.returnTable(stockTable1Data)}
              {this.returnTable(stockTable2Data)}
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
