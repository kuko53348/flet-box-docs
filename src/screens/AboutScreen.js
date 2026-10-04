// screens/AboutScreen.js
import { Container, Column, Row, Text, Button, Icon, colors, goTo } from 'flet-box';

export const AboutScreen = () => {
    return Container({
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: colors.background,
        child: Column({
            gap: 32,
            alignItems: 'center',
            children: [
                Container({
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    backgroundColor: colors.primary + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                    child: Icon({ name: 'rocket_launch', size: 56, color: colors.primary })
                }),
                Text({ 
                    text: 'Welcome to FletBox', 
                    size: 32, 
                    weight: 'bold', 
                    color: colors.text, 
                    align: 'center' 
                }),
                Text({ 
                    text: 'A simple and fast UI framework for building web apps with pure JavaScript.', 
                    size: 16, 
                    color: colors.textSecondary, 
                    align: 'center',
                    style: { maxWidth: 400 }
                }),
                Container({
                    marginTop: 16,
                    padding: 20,
                    borderRadius: 16,
                    backgroundColor: colors.surface,
                    style: { width: '100%', maxWidth: 400 },
                    child: Column({
                        gap: 12,
                        children: [
                            Text({ text: '✨ What is FletBox?', size: 18, weight: 'bold', color: colors.primary }),
                            Text({ text: 'FletBox helps you create web apps easily. No complex tools. Just write JavaScript.', size: 14, color: colors.textSecondary }),
                            Container({ height: 1, backgroundColor: colors.border, marginVertical: 8 }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Zero dependencies - lightweight', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: '40+ ready-to-use widgets', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Built-in navigation (router)', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Dark / Light theme', size: 14, color: colors.text })
                            ] }),
                            Row({ gap: 12, alignItems: 'center', children: [
                                Icon({ name: 'check_circle', size: 20, color: colors.success }),
                                Text({ text: 'Hot reload for fast development', size: 14, color: colors.text })
                            ] })
                        ]
                    })
                }),
                Button({ 
                    text: 'Back to Root', 
                    iconLeft: 'arrow_back',
                    variant: 'outlined',
                    bgColor: colors.info, 
                    color: colors.info, 
                    onPress: () => goTo('/') 
                })
            ]
        })
    });
};

export default AboutScreen;
