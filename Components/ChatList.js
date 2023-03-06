import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from 'react-native';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ChatListScreen extends Component {
  state = {
    chats: [],
    newChatName: '',
  };

  componentDidMount() {
    this.fetchChats();
  }

  fetchChats = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        headers: {
          'X-Authorization': await AsyncStorage.getItem('whatsthat_session_token'),
          Accept: 'application/json',
        },
      });
  
      if (response.status === 200) {
        const json = await response.json();
        const chats = json.map((item) => {
          let lastMessage = item.last_message;
          if (lastMessage && Object.keys(lastMessage).length > 0) {
            lastMessage = {
              message_id: lastMessage.message_id,
              timestamp: lastMessage.timestamp,
              message: lastMessage.message,
              author: {
                user_id: lastMessage.author.user_id,
                first_name: lastMessage.author.first_name,
                last_name: lastMessage.author.last_name,
                email: lastMessage.author.email,
              },
            };
          } else {
            lastMessage = null;
          }
          return {
            chat_id: item.chat_id,
            name: item.name,
            creator: {
              user_id: item.creator.user_id,
              first_name: item.creator.first_name,
              last_name: item.creator.last_name,
              email: item.creator.email,
            },
            last_message: lastMessage,
          };
        });
        this.setState({ chats });
      } else if (response.status === 401) {
        throw new Error('Unauthorised');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Not Found');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  createChat = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/1.0.0/chat', {
        method: 'POST',
        headers: {
          'X-Authorization': await AsyncStorage.getItem("whatsthat_session_token"),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: this.state.newChatName,
        }),
      });
  
      if (response.status === 201) {
        const json = await response.json();
        console.log(json);
        // Clear the chat name input field
        this.setState({ newChatName: '' });
        // Refresh the chat list
        this.fetchChats();
      } else if (response.status === 400) {
        throw new Error("Bad request");
      } else if (response.status === 401) {
        throw new Error('Unauthorized');
      } else if (response.status === 500) {
        throw new Error('Server Error');
      } else {
        throw new Error('Error');
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  renderChatItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          this.props.navigation.navigate('ChatScreen', { chatId: item.chat_id })
        }
      >
        <View style={styles.chatInfo}>
          <Text style={styles.chatName}>{item.name}</Text>
          <Text style={styles.lastMessage}>
            {item.last_message
              ? `${item.last_message.author.first_name} ${item.last_message.author.last_name}: ${item.last_message.message}`
              : 'No messages'}
          </Text>
        </View>
        <View style={styles.chatActions}>
          <Text style={styles.timestamp}>
            {item.last_message
              ? moment(item.last_message.timestamp).format('lll')
              : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const { chats, newChatName } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Chats</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.newChatInput}
            onChangeText={(text) => this.setState({ newChatName: text })}
            value={newChatName}
            placeholder="Enter new chat name"
          />
          <TouchableOpacity style={styles.createChatButton} onPress={this.createChat}>
            <Text style={styles.createChatButtonText}>Create</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={chats}
          renderItem={this.renderChatItem}
          keyExtractor={(item) => item.chat_id.toString()}
          style={styles.chatList}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    paddingHorizontal: 15,
    paddingTop: 30,
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {
    width: 0,
    height: 2,
  },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  newChatInput: {
    flex: 1,
    padding: 10,
  },
  createChatButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  createChatButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    marginTop: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    marginBottom: 10,
    shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  lastMessage: {
    color: '#757575',
  },
  timestamp: {
    color: '#757575',
    fontSize: 12,
  },
});
    




