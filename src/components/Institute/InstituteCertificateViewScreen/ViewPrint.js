import React, { Component } from 'react';
import {
    StatusBar,
    BackHandler,
    Dimensions,
    Platform,
    StyleSheet,
    View,
    TouchableOpacity,
    FlatList,
    Text
} from 'react-native';
import { Header, Left, Body, Right, Card, Title, Icon } from 'native-base';
import Loader from '../../../Utility/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ViewPrint extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            loaderText: 'Loading...',
            family_details: this.props.navigation.state.params.family_details || [],
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.props.navigation.navigate('InstituteMainScreen');
        return true;
    };

    renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.label}> Ration Card Number: </Text>
                <Text style={styles.value}>{item.ration_card_number}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.label}> Name: </Text>
                <Text style={styles.value}>{item.name}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.label}> UID: </Text>
                <Text style={styles.value}>{item.uid}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.label}> Relation: </Text>
                <Text style={styles.value}>{item.relation || 'N/A'}</Text>
            </View>
            <View style={{flexDirection:'row'}}>
                <Text style={styles.label}> DOB: </Text>
                <Text style={styles.value}>{item.dob}</Text>
            </View>
            
        </View>
    );

    render() {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor="#D34A44" barStyle="light-content" />

                <Loader loading={this.state.loading} text={this.state.loaderText} />

                <View style={styles.content}>
                    {this.state.family_details.length > 0 ? (
                        <FlatList
                            data={this.state.family_details}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={this.renderItem}
                            contentContainerStyle={styles.listContainer}
                        />
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>No Data Found</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#D34A44',
        elevation: 3,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scanNew: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    icon: {
        fontSize: 25,
        color: '#FFFFFF',
        paddingHorizontal: 10,
    },
    content: {
        flex: 1,
        padding: 15,
    },
    listContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    value: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 18,
        color: '#666',
    },
});
