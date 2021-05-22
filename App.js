// Payment Screen Example
import React, {Component, useEffect, useState} from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {BallIndicator} from 'react-native-indicators';
import {Divider} from 'react-native-paper';
import {Mitr as Text} from '../components/StyleTextComponent';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../components/ButtonComponent';
import {Input, CheckBox} from 'react-native-elements';
import {TextInput} from 'react-native-paper';
import {checkMark} from '../assets/index';
import PaymentItemComponent from '../components/PaymentItemComponent';

import * as actions from '../actions';
import {connect} from 'react-redux';

import * as color from '../constants/Colors';
import * as layout from '../constants/Layouts';

const {height, width} = layout.default.window;

const {marginTop, flex, justifyContent, marginLeft, marginRight} =
  layout.default.activityIndicator;

class PaymentScreen extends Component {
  constructor() {
    super();
    this._mounted = false;
    this.state = {
      isModalVisible: false,
      isSaveModalVisible: false,
      itemList: [],
      itemPayment: [],
      itemLoad: true,
      itemPaymentTotal: Number(0),
      itemPaymentTransfer: Number(0),
      itemAmount: Number(0),
    };
  }

  componentDidMount = () => {
    this._mounted = true;
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      if (this._mounted) {
        this.props.onGetProductListWithoutImage();
      }
    });
  };

  componentWillUnmount = () => {
    this._mounted = false;
    this.unsubscribe();
  };

  _toggleModal = () => {
    this.setState({
      isModalVisible: !this.state.isModalVisible,
      itemList: this.props.product.productList,
      itemLoad: false,
    });
  };

  _selectItem = (itemId, itemName) => {
    const {itemList, itemPayment} = this.state;
    const index = itemList.findIndex(find => find.productId === itemId);
    itemList[index].check = !itemList[index].check;

    this.setState({check: {...itemList[index]}});

    if (itemList[index].check) {
      this.setState(prevState => ({
        itemPayment: [
          ...prevState.itemPayment,
          {
            itemId: itemList[index].productId,
            itemName: itemList[index].productName,
            itemAmount: itemList[index].amount,
          },
        ],
      }));
    } else {
      this.setState(
        {
          itemPayment: this.state.itemPayment.filter(
            payment => payment.itemId !== itemId,
          ),
        },
        () => {
          const {itemPayment} = this.state;
          const totalItem = itemPayment.reduce(
            (sum, item) => Number(sum) + Number(item.itemAmount),
            0,
          );

          this.setState({
            itemPaymentTotal: Number(totalItem),
          });
        },
      );
    }
  };

  _setNumberOfItem = (itemId, amount) => {
    const {itemPayment} = this.state;
    const index = itemPayment.findIndex(find => find.itemId === itemId);
    itemPayment[index].itemAmount = Number(amount);

    const totalItem = itemPayment.reduce(
      (sum, item) => Number(sum) + Number(item.itemAmount),
      0,
    );

    this.setState({
      itemAmount: {...itemPayment[index]},
      itemPaymentTotal: Number(totalItem),
    });
  };

  _renderItem = () => {
    const {itemList} = this.state;
    return itemList.map((productList, i) => {
      return (
        <View key={i} style={styles.viewTextItem}>
          <CheckBox
            checkedColor={color.defaultColor}
            key={i}
            style={styles.checkbox}
            name={productList.productId}
            value={productList.productId}
            checked={productList.check === true ? true : false}
            onPress={() =>
              this._selectItem(productList.productId, productList.productName)
            }
            title={productList.productName}
          />
        </View>
      );
    });
  };

  _paymentTransfer = () => {
    const {
      itemPayment,
      itemPaymentTotal,
      itemPaymentTransfer,
      isSaveModalVisible,
    } = this.state;

    const {memberPoint} = this.props.member.userProfile;

    const params = {
      itemPayment,
      itemPaymentTotal,
      itemPaymentTransfer,
      memberPoint,
    };

    this.props.onSavePaymentTransfer(params, () => {
      if (this._mounted) {
        this.setState(
          {
            isModalVisible: false,
            isSaveModalVisible: false,
            itemList: [],
            itemPayment: [],
            itemLoad: true,
            itemPaymentTotal: Number(0),
            itemPaymentTransfer: Number(0),
            itemAmount: Number(0),
          },
          () => {
            this.props.navigation.navigate('ActivityTopTabStackNavigator', {
              screen: 'Payment',
            });
          },
        );
      }
      this.mounted = false;
    });
  };

  _setNumberOfTransfer = transfer => {
    this.setState({itemPaymentTransfer: Number(transfer)});
  };

  render() {
    const {
      isModalVisible,
      itemPayment,
      itemLoad,
      itemPaymentTotal,
      itemPaymentTransfer,
      itemAmount,
      isSaveModalVisible,
    } = this.state;

    const {loading, savingPaymentTransfer, saveDataComplete} =
      this.props.activity;

    let renderItemList;
    if (itemLoad || loading) {
      renderItemList = (
        <>
          <BallIndicator
            style={styles.activityIndicator}
            color={color.defaultColor}
          />
        </>
      );
    } else {
      renderItemList = (
        <>
          <View style={styles.viewInner}>
            <Text style={styles.textItemHeader}>สินค้า</Text>
            <ScrollView style={styles.bodyItemModal}>
              {this._renderItem()}
            </ScrollView>
            <Text style={styles.textExclude}>***แจ้งยอดไม่รวมของแถม</Text>
          </View>
          <TouchableWithoutFeedback onPress={this._toggleModal}>
            <View style={styles.viewCloseIcon}>
              <Image
                source={checkMark}
                resizeMode="stretch"
                style={styles.closeIcon}
              />
            </View>
          </TouchableWithoutFeedback>
        </>
      );
    }

    return (
      <View>
        <View>
          <Modal
            deviceWidth={width}
            deviceHeight={height}
            isVisible={isModalVisible}>
            {renderItemList}
          </Modal>
          <Modal
            deviceWidth={width}
            deviceHeight={height}
            isVisible={savingPaymentTransfer}>
            <Animated.View
              style={[
                styles.viewSavingInner,
                {justifyContent: 'center', alignItems: 'center'},
              ]}>
              <Text style={{fontSize: 16}}>
                {saveDataComplete ? 'save complete' : 'saving data.....'}
              </Text>
            </Animated.View>
          </Modal>
        </View>

        {itemPayment.length === 0 ? (
          <View style={styles.viewAddItem}>
            <TouchableOpacity onPress={this._toggleModal}>
              <MaterialCommunityIcons
                name="cart-plus"
                color={color.defaultColor}
                size={30}
              />
              <Text>เลือกสินค้า</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.viewAddItem}>
            <TouchableOpacity onPress={this._toggleModal}>
              <MaterialCommunityIcons
                name="cart-plus"
                color={'red'}
                size={30}
              />
              <Text>แก้ไขสินค้า</Text>
            </TouchableOpacity>
          </View>
        )}
        {Array.isArray(itemPayment) && itemPayment.length > 0 && (
          <>
            <View style={styles.itemSelectedListTitle}>
              <Text style={styles.textItemPayment}>
                รายการสินค้าที่เลือกแจ้งชำระเงิน
              </Text>
              <Text style={styles.textItemPayment}>(กระปุก)</Text>
            </View>
            <ScrollView
              vertical={true}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{flex: 0}}
              bounces={false}
              style={styles.scrollViewItemPayment}>
              {itemPayment.map((payment, i) => {
                const amount = payment.itemAmount;
                return (
                  <View
                    key={payment.itemId}
                    style={styles.itemSelectedListBody}>
                    <Text style={styles.textPayment}>{payment.itemName}</Text>
                    <TextInput
                      // showSoftInputOnFocus={false}
                      style={styles.textInput}
                      onChangeText={amount =>
                        this._setNumberOfItem(payment.itemId, amount)
                      }
                      value={String(amount)}
                      keyboardType="numeric"
                    />
                  </View>
                );
              })}
            </ScrollView>
            <Divider
              style={[styles.divider, {backgroundColor: color.defaultColor}]}
            />
            <View style={styles.viewItemResult}>
              <Text style={styles.textItemPaymentResult}>รวมจำนวนกระปุก</Text>
              <Text style={styles.textItemPaymentResult}>
                {itemPaymentTotal}
              </Text>
            </View>
            <View style={styles.viewTransferMoney}>
              <Text style={styles.textItemPaymentResult}>จำนวนเงินที่โอน</Text>
              <TextInput
                style={styles.textInput}
                value={String(itemPaymentTransfer)}
                keyboardType="numeric"
                onChangeText={itemPaymentTransfer =>
                  this._setNumberOfTransfer(itemPaymentTransfer)
                }
              />
            </View>

            <View style={styles.viewPaymentTransferButton}>
              <CustomButton
                title={'แจ้งการโอนเงิน'}
                type={'solid'}
                onPress={this._paymentTransfer}
                titleStyles={{color: color.defaultColor}}
                customStyles={{
                  backgroundColor: color.defaultButton,
                  width: width / 1.05,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                disable={Number(itemPaymentTotal) === 0 ? true : false}
              />
            </View>
          </>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    alignItems: 'center',
    flex,
    justifyContent,
    marginLeft,
    marginRight,
  },

  viewSavingInner: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: width / 1.2,
    height: height / 8,
  },
  viewInner: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    height: height / 1.8,
    marginTop: height / 12,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: width / 1.1,
  },

  divider: {
    borderRadius: 10,
    height: height / 100,
    marginLeft: width / 50,
    marginRight: width / 50,
    marginBottom: height / 50,
  },
  viewPaymentTransferButton: {
    marginTop: height / 40,
  },
  textItemPayment: {fontSize: 16},
  textItemPaymentResult: {fontSize: 16},
  viewItemResult: {
    marginRight: width / 25,
    marginLeft: width / 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewTransferMoney: {
    marginRight: width / 25,
    marginLeft: width / 25,
    marginTop: height / 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInput: {height: height / 20},
  scrollViewItemPayment: {height: height / 3},
  textPayment: {fontSize: 16},
  viewItemPaymentList: {
    flexDirection: 'row',
    margin: height / 30,
    backgroundColor: 'red',
    justifyContent: 'space-between',
  },
  itemSelectedListTitle: {
    margin: width / 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemSelectedListBody: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingBottom: 5,
    marginRight: width / 25,
    marginLeft: width / 25,

    justifyContent: 'space-between',
  },
  checkbox: {
    width: width / 10,
  },

  textItemHeader: {textAlign: 'center', fontSize: 18, padding: height / 40},
  textExclude: {
    textAlign: 'left',
    fontSize: 18,
    padding: height / 40,
    color: 'red',
  },
  closeIcon: {
    alignSelf: 'center',
    width: width / 8,
    height: height / 14.2,
  },
  viewCloseIcon: {marginTop: height / 30},
  textCloseModal: {
    color: '#FFF',
    marginLeft: 'auto',
    marginRight: 'auto',
    fontSize: 16,
    padding: height / 70,
  },
  bodyItemModal: {
    marginTop: height / 100,
    height: height / 3,
  },

  viewAddItem: {
    width: width / 4,
    height: height / 10,
    marginTop: height / 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state, ownProps) => ({
  product: state.products,
  member: state.members,
  activity: state.activities,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  onGetProductListWithoutImage: params =>
    dispatch(actions.getProductListWithoutImage(params)),
  onSavePaymentTransfer: (params, callback) =>
    dispatch(actions.savePaymentTransfer(params, callback)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PaymentScreen);
