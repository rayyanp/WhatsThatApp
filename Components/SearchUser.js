import React, { Component } from 'react';
import { View, Text, TextInput, TouchableOpacity, Button, StyleSheet,ScrollView, SectionList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

class SearchUsers extends Component {
  state = {
    query: '',
    searchIn: 'all',
    limit: 20,
    offset: 0,
    users: [],
    showSuccess: false,
    error: ''
  };

  searchUsers = async () => {
    const { query, searchIn, limit, offset } = this.state;

    if (!query) {
      this.setState({ error: 'Please enter a search query' });
      return;
    }

    fetch(`http://localhost:3333/api/1.0.0/search?q=`+query+`&search_in=`+searchIn+`&limit=`+limit+`&offset=`+offset, {
      method: 'GET',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Accept': 'application/json',
      },
    })
      .then(response => {
        if (response.status === 200) {
          console.log('OK');
        } else if (response.status === 400) {
          console.error('Bad Request');
        } else if (response.status === 401) {
          console.error('Unauthorized');
        } else if (response.status === 500) {
          console.error('Server Error');
        }
        return response.json();
      })
      .then(data => {
        if (data.length === 0) {
          this.setState({ error: 'No results' });
        } else {
          this.setState({ users: data, error: '' });
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  addContact = async (id) => {
    fetch(`http://localhost:3333/api/1.0.0/user/`+id+`/contact`, {
      method: 'POST',
      headers: {
        'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (response.status === 200) {
          console.log('User added to contacts');
          this.setState({ showSuccess: true });
        } else if (response.status === 400) {
          console.error('You cant add yourself as a contact');
        } else if (response.status === 401) {
          console.error('Unauthorized');
        } else if (response.status === 404) {
          console.error('User not found');
        } else if (response.status === 500) {
          console.error('Server Error');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <Button
        title="Add Contact"
        onPress={() => this.addContact(item.user_id)}
        style={styles.addContactButton}
      />
    </View>
  );

  renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{title}</Text>
    </View>
  );


  render() {
    const { users, error, showSuccess } = this.state;
  
    const sections = [{ title: 'Users', data: users }];
  
    return (
      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TextInput
            placeholder="Search users"
            style={styles.searchInput}
            onChangeText={(query) => this.setState({ query })}
          />
          <Button title="Search" onPress={this.searchUsers} style={styles.searchButton} />
        </View>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView>
            {showSuccess && (
              <View style={styles.successContainer}>
                <TouchableOpacity onPress={() => this.setState({ showSuccess: false })} style={styles.closeButton}>
                  <Ionicons name="close-circle" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.successText}>User added to contacts!</Text>
              </View>
            )}
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.user_id}
              renderItem={this.renderItem}
              renderSectionHeader={this.renderSectionHeader}
            />
          </ScrollView>
        )}
      </View>
    );
  }
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5FCFF',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 10,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  searchButton: {
    width: 80,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  addContactButton: {
    marginLeft: 10,
  },
  sectionHeader: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffeaea',
    borderRadius: 5,
    marginVertical: 10,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 16,
  },
  successContainer: {
    backgroundColor: '#eaffea',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    position: 'relative',
  },
  successText: {
    color: '#008000',
    fontSize: 16,
    marginLeft: 10,
    },
  closeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
});
  
    
    export default SearchUsers;