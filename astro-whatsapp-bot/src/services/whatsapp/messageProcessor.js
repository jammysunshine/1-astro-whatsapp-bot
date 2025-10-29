case 'show_divination_mystic_menu': {
    const userLanguage = getUserLanguage(user, phoneNumber);
    const divinationMenu = await getTranslatedMenu('divination_mystic_menu', userLanguage);
    if (divinationMenu) {
      await sendMessage(
        phoneNumber,
        divinationMenu,
        'interactive'
      );
    }
    return null;
  }