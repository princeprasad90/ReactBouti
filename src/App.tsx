import { STATE_LOGIN, STATE_SIGNUP } from 'components/AuthForm';
import GAListener from 'components/GAListener';
import { EmptyLayout, LayoutRoute, MainLayout,ProtectedRoute } from 'components/Layout';
import PageSpinner from 'components/PageSpinner';
import AuthPage from 'pages/AuthPage';
import React from 'react';
import componentQueries from 'react-component-queries';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import './styles/reduction.scss';
import 'react-toastify/dist/ReactToastify.css';

const AlertPage = React.lazy(() => import('pages/AlertPage'));
const AuthModalPage = React.lazy(() => import('pages/AuthModalPage'));
const BadgePage = React.lazy(() => import('pages/BadgePage'));
const ButtonGroupPage = React.lazy(() => import('pages/ButtonGroupPage'));
const ButtonPage = React.lazy(() => import('pages/ButtonPage'));
// const CardPage = React.lazy(() => import('pages/CardPage'));
const ChartPage = React.lazy(() => import('pages/ChartPage'));
const DashboardPage = React.lazy(() => import('pages/DashboardPage'));
const DropdownPage = React.lazy(() => import('pages/DropdownPage'));
const FormPage = React.lazy(() => import('pages/FormPage'));
const InputGroupPage = React.lazy(() => import('pages/InputGroupPage'));
const ModalPage = React.lazy(() => import('pages/ModalPage'));
const ProgressPage = React.lazy(() => import('pages/ProgressPage'));
const TablePage = React.lazy(() => import('pages/TablePage'));
const TypographyPage = React.lazy(() => import('pages/TypographyPage'));
const WidgetPage = React.lazy(() => import('pages/WidgetPage'));
const MyOrder = React.lazy(() => import('pages/Celebrity/salesorder/myorder'));
const createorder = React.lazy(() => import('pages/Celebrity/salesorder/createorder'));
const UserMaster = React.lazy(() => import('pages/Celebrity/user/UserMaster'));
const PendingOrder = React.lazy(() => import('pages/Celebrity/salesorder/pendingorder'));
const OrderSearch = React.lazy(() => import('pages/Celebrity/salesorder/ordersearch'));
const OrderConfirm = React.lazy(() => import('pages/Celebrity/salesorder/orderconfirm'));
const OrderApproval = React.lazy(() => import('pages/Celebrity/salesorder/OrderApproval'));
const ApprovalMatrix = React.lazy(() => import('pages/Celebrity/user/ApprovalMatrix'));
const AddressMaster = React.lazy(() => import('pages/Celebrity/user/AddressMaster'));
const AddressCreate = React.lazy(() => import('pages/Celebrity/user/AddressCreate'));
const EditOrder = React.lazy(() => import('pages/Celebrity/salesorder/editorder'));
const RuleMaster = React.lazy(() => import('pages/Celebrity/setupmaster/RuleMaster'));
const DelegateMaster = React.lazy(() => import('pages/Celebrity/setupmaster/DelegateMaster'));
const GRNqtyMaster = React.lazy(() => import('pages/Celebrity/setupmaster/GRNqtyMaster'));
const Welcome = React.lazy(() => import('pages/Helper/Welcome'));
const Role = React.lazy(() => import('pages/Helper/Role'));
const CampaignSearch = React.lazy(() => import('pages/Celebrity/salesorder/campaignSearch'));
const ViewMapping = React.lazy(() => import('pages/Celebrity/setupmaster/ViewMapping'));
const AMJrRMMapping = React.lazy(() => import('pages/Celebrity/setupmaster/AMJrRMMapping'));
const RMMapping = React.lazy(() => import('pages/Celebrity/user/RMMapping'));
const JrRMDelgateMapping = React.lazy(() => import('pages/Celebrity/setupmaster/JrRMDelgateMapping'));


// #region NotifyMe 
const NotifyList = React.lazy(() => import('pages/NotifyMe/NotifyList'));
// #endregion

// #region Booster 
const Batch = React.lazy(() => import('pages/Booster/batch'));
const Campaign = React.lazy(() => import('pages/Booster/Campaign'));
const Catalog = React.lazy(() => import('pages/Booster/catalog'));
const CampaignApproval = React.lazy(() => import('pages/Booster/CampaignApproval'));
const CampaignListing = React.lazy(() => import('pages/Booster/CampaignListing'));
const CampaignHistory = React.lazy(() => import('pages/Booster/CampaignHistory'));
const CampaignListSearch = React.lazy(() => import('pages/Booster/CampaignListSearch'));
const BoosterApprovalMatrix = React.lazy(() => import('pages/Booster/BoosterApprovalMatrix'));
const CampaignDelegate = React.lazy(() => import('pages/Booster/CampaignDelegate'));


// #endregion

const getBasename = () => {

  return `/${process.env.PUBLIC_URL.split('/').pop()}`;
};

interface AppProps {
  breakpoint?: string;
  history?: any;
}

class App extends React.Component<AppProps> {

  componentDidMount() {
    const { history } = this.props as any;
    history.listen(() => {
      history.go(1);
    });
  }

  render() {

    return (
      <BrowserRouter basename={getBasename()}>
        {/* <GAListener> */}
          <Switch>
            <LayoutRoute
              exact
              path="/"
              layout={EmptyLayout}
              component={props => (
                <AuthPage {...props} authState={STATE_LOGIN} />
              )}
            />
            <LayoutRoute
              exact
              path="/login"
              layout={EmptyLayout}
              component={props => (
                <AuthPage {...props} authState={STATE_LOGIN} />
              )}
            />
            <LayoutRoute
              exact
              path="/signup"
              layout={EmptyLayout}
              component={props => (
                <AuthPage {...props} authState={STATE_SIGNUP} />
              )}
            />
            <MainLayout breakpoint={this.props.breakpoint}>
              <React.Suspense fallback={<PageSpinner />}>
              <Switch>
               
                {/* <Route exact path="/dashboard" component={DashboardPage} /> 
                <Route exact path="/login-modal" component={AuthModalPage} />
                <Route exact path="/buttons" component={ButtonPage} />
                 <Route exact path="/cards" component={CardPage} /> 
                 <Route exact path="/widgets" component={WidgetPage} />
                <Route exact path="/typography" component={TypographyPage} />
                <Route exact path="/alerts" component={AlertPage} />
                <Route exact path="/tables" component={TablePage} />
                <Route exact path="/badges" component={BadgePage} />
                <Route exact path="/button-groups" component={ButtonGroupPage}/>
                <Route exact path="/dropdowns" component={DropdownPage} />
                <Route exact path="/progress" component={ProgressPage} />
                <Route exact path="/modals" component={ModalPage} />
                <Route exact path="/forms" component={FormPage} />
                <Route exact path="/input-groups" component={InputGroupPage} />
                <Route exact path="/charts" component={ChartPage} /> */}
                 <Route exact path="/dashboard" component={props => <DashboardPage {...props} />} />
                <Route exact path="/welcome" component={Welcome} />
                {/* <Route exact path="/RMMapping" component={RMMapping} /> */}
                
                
                
                <ProtectedRoute exact path="/myorder" component={MyOrder} />
                <ProtectedRoute exact path="/createorder" component={createorder} />
                <ProtectedRoute exact path="/userMaster" component={UserMaster} />
                <ProtectedRoute exact path="/pendingorder" component={PendingOrder} />
                <ProtectedRoute exact path="/ordersearch" component={OrderSearch} />
                <ProtectedRoute exact path="/orderconfirm" component={OrderConfirm} />
                <ProtectedRoute exact path="/OrderApproval" component={OrderApproval} />
                <ProtectedRoute exact path="/approvalMatrix" component={ApprovalMatrix} />
                <ProtectedRoute exact path="/addressMaster" component={AddressMaster} />
                <ProtectedRoute exact path="/ruleMaster" component={RuleMaster} />
                <ProtectedRoute exact path="/delegateMaster" component={DelegateMaster} />
                <ProtectedRoute exact path="/GRNqtyMaster" component={GRNqtyMaster} />
                <ProtectedRoute exact path="/addressCreate" component={AddressCreate} />
                <ProtectedRoute exact path="/editorder" component={EditOrder} />
                <ProtectedRoute exact path="/notifyList" component={NotifyList} />
                <ProtectedRoute exact path="/role" component={Role} />
                <ProtectedRoute exact path="/campaignSearch" component={CampaignSearch} />
                <ProtectedRoute exact path="/batch" component={Batch} />             
                <ProtectedRoute exact path="/CampaignApproval" component={CampaignApproval} />  
                <ProtectedRoute exact path="/CampaignListing" component={CampaignListSearch} />
                <ProtectedRoute exact path="/Campaign" component={Campaign} />  
                <ProtectedRoute exact path="/BoosterApprovalMatrix" component={BoosterApprovalMatrix} />  
                <ProtectedRoute exact path="/catalog" component={Catalog} /> 
                <ProtectedRoute exact path="/ViewMapping" component={ViewMapping} />  
                <ProtectedRoute exact path="/AMJrRMMapping" component={AMJrRMMapping} />  
                <ProtectedRoute exact path="/RMMapping" component={RMMapping} />
                <ProtectedRoute exact path="/JrRMDelgateMapping" component={JrRMDelgateMapping} />  
                <ProtectedRoute exact path="/CampaignDelegate" component={CampaignDelegate} />  

                {/* <ProtectedRoute exact path="/CampaignHistory" component={CampaignHistory} />             */}
                </Switch>
              </React.Suspense>
            </MainLayout>
          <Redirect to="/" />
          </Switch>
        {/* </GAListener> */}
      </BrowserRouter>
    );
  }
}

const query = ({ width }: { width: number }) => {
  if (width < 575) {
    return { breakpoint: 'xs' };
  }

  if (576 < width && width < 767) {
    return { breakpoint: 'sm' };
  }

  if (768 < width && width < 991) {
    return { breakpoint: 'md' };
  }

  if (992 < width && width < 1199) {
    return { breakpoint: 'lg' };
  }

  if (width > 1200) {
    return { breakpoint: 'xl' };
  }

  return { breakpoint: 'xs' };
};

export default componentQueries(query)(App);
