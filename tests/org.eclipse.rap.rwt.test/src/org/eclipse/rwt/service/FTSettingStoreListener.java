/*******************************************************************************
 * Copyright (c) 2002, 2011 Innoopract Informationssysteme GmbH and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Innoopract Informationssysteme GmbH - initial API and implementation
 *    EclipseSource - ongoing development
 ******************************************************************************/

package org.eclipse.rwt.service;

final class FTSettingStoreListener 
  implements SettingStoreListener
{

  private int count = 0;
  private SettingStoreEvent lastEvent;
  
  public void settingChanged( SettingStoreEvent event ) {
      count++;
      lastEvent = event;
  }
  
  int getCount() {
    return count;
  }
  
  SettingStoreEvent getEvent() {
    return lastEvent;
  }
}