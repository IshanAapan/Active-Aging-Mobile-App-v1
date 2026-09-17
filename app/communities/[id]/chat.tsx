// Community Group Chat Screen

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../src/constants/colors';
import { FontSize, FontWeight } from '../../../src/constants/typography';
import { Spacing, BorderRadius, TouchTarget } from '../../../src/constants/spacing';
import { Avatar } from '../../../src/components/ui/Avatar';
import { chatService } from '../../../src/services/chatService';
import { communityService } from '../../../src/services/communityService';
import { Message } from '../../../src/types/message';
import { Community } from '../../../src/types/community';
import { formatMessageTime, timeAgo } from '../../../src/utils/date';
import { mockUsers, CURRENT_USER_ID } from '../../../src/data/mockUsers';

const CURRENT_USER = mockUsers.find(u => u.id === CURRENT_USER_ID)!;

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}

function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  function handleLongPress() {
    Alert.alert(
      'Message options',
      undefined,
      [
        {
          text: 'Report message',
          style: 'destructive',
          onPress: () => chatService.reportMessage(message.id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }

  return (
    <View style={[styles.messageRow, isOwn ? styles.ownRow : undefined]}>
      {!isOwn && (
        <View style={styles.avatarSpace}>
          {showAvatar && (
            <Avatar uri={message.senderPhoto} name={message.senderName} size={34} />
          )}
        </View>
      )}
      <View style={[styles.bubbleContainer, isOwn ? styles.ownBubbleContainer : undefined]}>
        {!isOwn && showAvatar && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <TouchableOpacity
          onLongPress={handleLongPress}
          activeOpacity={0.8}
          accessibilityLabel={`Message from ${message.senderName}: ${message.text}`}
        >
          <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
            <Text style={[styles.bubbleText, isOwn ? styles.ownBubbleText : undefined]}>
              {message.text}
            </Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.timeText, isOwn ? styles.ownTimeText : undefined]}>
          {formatMessageTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [community, setCommunity] = useState<Community | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!id) return;
    const [comm, msgs] = await Promise.all([
      communityService.getCommunityById(id),
      chatService.getMessages(id),
    ]);
    setCommunity(comm);
    setMessages(msgs);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  }

  async function handleSend() {
    if (!inputText.trim() || !id || sending) return;
    const text = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      const message = await chatService.sendMessage(
        id,
        CURRENT_USER_ID,
        CURRENT_USER.name,
        CURRENT_USER.photo,
        text
      );
      setMessages(prev => [...prev, message]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {community?.name ?? 'Chat'}
            </Text>
            <Text style={styles.headerSub}>
              {community?.memberIds.length ?? 0} members
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="More options"
          >
            <Ionicons name="ellipsis-vertical" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isOwn = item.senderId === CURRENT_USER_ID;
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showAvatar = !prevMsg || prevMsg.senderId !== item.senderId;
            return (
              <MessageBubble
                message={item}
                isOwn={isOwn}
                showAvatar={showAvatar}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatIcon}>💬</Text>
              <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
            </View>
          }
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            returnKeyType="default"
            accessibilityLabel="Message input"
          />
          <TouchableOpacity
            style={[styles.sendBtn, inputText.trim() ? styles.sendBtnActive : undefined]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? Colors.textInverse : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    gap: Spacing.sm,
  },
  backBtn: {
    width: TouchTarget.comfortable,
    height: TouchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  headerSub: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  headerAction: {
    width: TouchTarget.comfortable,
    height: TouchTarget.comfortable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  ownRow: {
    justifyContent: 'flex-end',
  },
  avatarSpace: {
    width: 38,
    marginRight: Spacing.xs,
    alignItems: 'flex-start',
  },
  bubbleContainer: {
    maxWidth: '75%',
    gap: 2,
  },
  ownBubbleContainer: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semiBold,
    color: Colors.primary,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '100%',
  },
  otherBubble: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  ownBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: FontSize.bodyLg,
    color: Colors.text,
    lineHeight: FontSize.bodyLg * 1.4,
  },
  ownBubbleText: {
    color: Colors.textInverse,
  },
  timeText: {
    fontSize: FontSize.caption,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  ownTimeText: {
    textAlign: 'right',
    marginRight: 4,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyChatIcon: { fontSize: 48 },
  emptyChatText: {
    fontSize: FontSize.bodyLg,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.backgroundAlt,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: FontSize.bodyLg,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxHeight: 120,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.skeleton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
  },
});
