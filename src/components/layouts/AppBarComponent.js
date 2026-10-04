// components/layouts/AppBarComponent.js
import { AppBar, Icon, colors, openDrawer } from 'flet-box';

export const AppBarComponent = ({ title, isMobile = false, showBack = false, onBack }) => {
    return AppBar({
        title: title,
        backgroundColor: colors.primary,
        titleColor: '#ffffff',
        centerTitle: true,
        showBackButton: showBack,
        leading: isMobile ? Icon({
            name: 'menu',
            size: 24,
            color: '#ffffff',
            onclick: () => openDrawer()
        }) : null,
        onBackPress: onBack,
        elevation: 2
    });
};
